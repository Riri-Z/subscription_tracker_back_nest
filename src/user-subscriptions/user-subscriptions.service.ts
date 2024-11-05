import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { Between, LessThan, Repository } from 'typeorm';
import { UserSubscriptions } from './entities/user-subscription.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { StatusSubscription } from 'src/users/enums/statusSubscription';
import { BillingCycle } from 'src/users/enums/billingCycle';

@Injectable()
export class UserSubscriptionsService {
  constructor(
    @InjectRepository(UserSubscriptions)
    private readonly userSubscriptionRepository: Repository<UserSubscriptions>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(createUserSubscriptionDto: CreateUserSubscriptionDto) {
    try {
      // Check if  subscription exist
      const subscription = await this.subscriptionsService.findByName(
        createUserSubscriptionDto.subscriptionName,
      );

      const subscriptionId = subscription
        ? subscription.id
        : //create subscription if it doesn't exist
          await this.subscriptionsService
            .create({
              name: createUserSubscriptionDto.subscriptionName,
              // TODO : find a way to categorize subscription
              category: createUserSubscriptionDto?.subscriptionCategory,
              // TODO : find a way to set one by default if possible
              icon_name: createUserSubscriptionDto?.icon_name,
            })
            .then((res) => res.id);

      const createdUserSubscription =
        await this.userSubscriptionRepository.save({
          userId: createUserSubscriptionDto.userId,
          subscriptionId: subscriptionId,
          name: createUserSubscriptionDto.subscriptionName,
          startDate: createUserSubscriptionDto.startDate,
          endDate: createUserSubscriptionDto.endDate,
          renewalDate: createUserSubscriptionDto.renewalDate,
          amount: createUserSubscriptionDto.amount,
          billingCycle: createUserSubscriptionDto.billingCycle,
          status:
            createUserSubscriptionDto.status ?? StatusSubscription['ACTIVE'],
        });

      return createdUserSubscription;
    } catch (error) {
      console.log(error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error creating new user-subscription',
        {
          cause: error,
        },
      );
    }
  }

  async findAll(userId: number): Promise<UserSubscriptions[]> {
    return await this.userSubscriptionRepository.find({
      relations: { subscription: true },
      where: { userId },
    });
  }

  async findActiveSubscriptionByMonth(date: string, userId: number) {
    try {

      const endDate: Date = dayjs(date).endOf('month').toDate();

      let subscriptions = await this.userSubscriptionRepository.find({
        relations: { subscription: true },
        where: {
          userId,
          status: StatusSubscription['ACTIVE'],
          startDate: LessThan(endDate),
        },
      });

      if (subscriptions.length === 0) {
        console.log(
          `No subscriptions found for the following userID and date :  ${userId},   ${date}`,
        );
      } else {
        subscriptions =
          UserSubscriptionsService.getPaymentDatesForSubscription(
            subscriptions,
            endDate,
          );
      }

      return subscriptions;
    } catch (error) {
      console.error(
        `Erreur lors de la recherche des souscriptions: ${error.message}`,
      );

      throw new InternalServerErrorException(
        'Erreur lors de la récupération des souscriptions mensuelles',
      );
    }
  }


  // TODO : REFACTOR , SPLIT LOGIC
  /*
  Return subscriptions with an array of nextPaiements
  */
  static getPaymentDatesForSubscription(
    userSubscriptions: UserSubscriptions[],
    endDate: Date,
  ) {
    const filteredUserSubscription = userSubscriptions.map((subscription) => {
      const billingCyle: BillingCycle = subscription.billingCycle;
      const startDate = subscription.startDate;
      const targetMonth = dayjs(startDate).month();
      const targetYear = dayjs(startDate).year();

      const mapBillingCycle: Record<BillingCycle,  dayjs.ManipulateType> = {
        [BillingCycle.WEEKLY]: 'week',
        [BillingCycle.MONTHLY]: 'month',
        [BillingCycle.YEARLY]: 'year',
      } as const;

      const result = [];
      let currentDate = dayjs(startDate);
      while (currentDate.isBefore(dayjs(endDate))) {
        // check if date payement is in the targeted month
        if (UserSubscriptionsService.isInTargetPeriod(currentDate,targetMonth,targetYear)) {
          result.push(currentDate);
        }
       const unit= mapBillingCycle[billingCyle]
        currentDate = currentDate.add(1, unit);
      }
      return { ...subscription, nextsPayements: result };
    });

    return filteredUserSubscription;
  }


  private static isInTargetPeriod(
    date: dayjs.Dayjs,
    targetMonth: number,
    targetYear: number,
  ): boolean {
    return date.month() === targetMonth && date.year() === targetYear;
  }

  findOne(id: number) {
    return `This action returns a #${id} userSubscription`;
  }

  update(id: number, updateUserSubscriptionDto: UpdateUserSubscriptionDto) {
    return `This action updates a #${id} userSubscription with the following values : ${JSON.stringify(updateUserSubscriptionDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} userSubscription`;
  }
}
