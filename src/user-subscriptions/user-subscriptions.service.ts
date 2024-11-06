import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { LessThan, Repository } from 'typeorm';
import { UserSubscriptions } from './entities/user-subscription.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs, { Dayjs } from 'dayjs';
import { StatusSubscription } from 'src/users/enums/statusSubscription';
import { BillingCycle } from 'src/users/enums/billingCycle';

@Injectable()
export class UserSubscriptionsService {
  constructor(
    @InjectRepository(UserSubscriptions)
    private readonly userSubscriptionRepository: Repository<UserSubscriptions>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  BILLING_CYCLE_TO_UNIT_DAY_JS: Record<BillingCycle, dayjs.ManipulateType> = {
    [BillingCycle.WEEKLY]: 'week',
    [BillingCycle.MONTHLY]: 'month',
    [BillingCycle.YEARLY]: 'year',
  } as const;

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
        subscriptions = this.getPaymentDatesForSubscription(
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

  getPaymentDatesForSubscription(
    userSubscriptions: UserSubscriptions[],
    targetDate: Date,
  ) {
    const filteredUserSubscription = userSubscriptions.map((subscription) => {
      const upcomingPaymentForecasts = this.generateUpcominPaymentDates(
        subscription.startDate,
        targetDate,
        subscription.billingCycle,
      );

      return { ...subscription, nextsPayements: upcomingPaymentForecasts };
    });

    return filteredUserSubscription;
  }

  generateUpcominPaymentDates(
    startDate: Date,
    targetDate: Date,
    billingCycle: BillingCycle,
  ) {
    const targetMonth = dayjs(targetDate).month();
    const targetYear = dayjs(targetDate).year();
    const paymentDates: dayjs.Dayjs[] = [];
    let currentDate = dayjs(startDate);

    while (currentDate.isBefore(dayjs(targetDate))) {
      // check if date payement is in the targeted month
      if (this.isInTargetPeriod(currentDate, targetMonth, targetYear)) {
        paymentDates.push(currentDate);
      }
      currentDate = this.getNextPaymentDate(billingCycle, currentDate);
      // currentDate = currentDate.add(1, unit);
    }

    return paymentDates;
  }

  getNextPaymentDate(billingCycle: BillingCycle, currentDate: Dayjs) {
    const unit = this.BILLING_CYCLE_TO_UNIT_DAY_JS[billingCycle];

    return currentDate.add(1, unit);
  }

  isInTargetPeriod(
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
