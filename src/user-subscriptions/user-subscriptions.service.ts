import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { DataSource, LessThan, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
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

      // Do we need to allow one type of subscription per user ?
      // eg : one netflix subscription , one amazon subscription
      const createdUserSubscription =
        await this.userSubscriptionRepository.save({
          userId: createUserSubscriptionDto.userId,
          subscriptionId: subscriptionId,
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

  /**
   * Get active subscription for a given month
   * @param date start of the month
   * @param userId
   * @returns userSubscriptions[]
   */
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
        console.info(
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

  /**
   * Get the current and next payment dates for a given subscription
   */
  getPaymentDatesForSubscription(
    userSubscriptions: UserSubscriptions[],
    targetDate: Date,
  ) {
    targetDate = dayjs(targetDate).add(1, 'month').toDate();
    const subscriptionWithPaymentForecasts = userSubscriptions.map(
      (subscription) => {
        const upcomingPaymentForecasts = this.generateUpcominPaymentDates(
          subscription.startDate,
          targetDate,
          subscription.billingCycle,
          subscription.startDate,
        );

        return { ...subscription, nextsPayements: upcomingPaymentForecasts };
      },
    );

    return subscriptionWithPaymentForecasts.filter(
      (subscription) => subscription.nextsPayements.length > 0,
    );
  }

  /**
   * Generate payment dates
   * @param startDate start of month
   * @param targetDate end of next month
   * @param billingCycle
   * @param startDateSubscription
   * @returns
   */
  generateUpcominPaymentDates(
    startDate: Date,
    targetDate: Date,
    billingCycle: BillingCycle,
    startDateSubscription: Date,
  ) {
    const paymentDates: dayjs.Dayjs[] = [];
    let currentDate = dayjs(startDate);

    while (currentDate.isBefore(dayjs(targetDate))) {
      // check if date payement is in the targeted month
      if (this.isInTargetPeriod(currentDate, targetDate, startDate)) {
        paymentDates.push(currentDate);
      }
      currentDate = this.getNextPaymentDate(
        billingCycle,
        currentDate,
        startDateSubscription,
      );
    }

    return paymentDates;
  }

  getNextPaymentDate(
    billingCycle: BillingCycle,
    currentDate: Dayjs,
    startDateSubscription: Date,
  ) {
    const unit = this.BILLING_CYCLE_TO_UNIT_DAY_JS[billingCycle];

    // NextDate previsional
    const nextIteration = currentDate.add(1, unit);
    const startOriginalDayDate = dayjs(startDateSubscription).get('date');

    if (billingCycle === BillingCycle.WEEKLY) {
      // handle weekly billing cycle
    }

    if (billingCycle === BillingCycle.MONTHLY) {
      // handle monthly billing cycle
      if (startOriginalDayDate !== nextIteration.get('date')) {
        if (startOriginalDayDate > currentDate.get('date')) {
          // In case the end of next month is more than the nextPaiementDate from previous month eg : 31/01/2025 -> 28/02/2025
          return nextIteration.set('date', startOriginalDayDate);
        } else {
          // In case the end of next month is less than the start date of the subscription eg : 31/01/2025 -> 28/02/2025
          return nextIteration.set(
            'date',
            nextIteration.endOf('month').get('date'),
          );
        }
      }
    }

    if (billingCycle === BillingCycle.YEARLY) {
      //handle yearly billing cycle
    }

    return nextIteration;
  }

  isInTargetPeriod(
    date: Dayjs,
    targetDate: Date,
    startDateSubscription: Date,
  ): boolean {
    return (
      !dayjs(startDateSubscription).isAfter(date) &&
      date.isBefore(dayjs(targetDate))
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} userSubscription`;
  }

  async update(
    id: number,
    updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    try {
      // Checking if  userSubscription exist
      const oldUserSubscription =
        await this.userSubscriptionRepository.findOneBy({ id });

      if (!oldUserSubscription) {
        throw new ConflictException(
          ' userSubscription not found with the given ID: ' + id,
        );
      }

      // TODO : check if newUserSubscription is complete. if not throw an error
      const newUserSubscription = {
        id: updateUserSubscriptionDto.id,
        userId: updateUserSubscriptionDto.userId,
        subscriptionId: updateUserSubscriptionDto.subscription.id,
        startDate: updateUserSubscriptionDto.startDate,
        endDate: updateUserSubscriptionDto.endDate,
        renewalDate: updateUserSubscriptionDto.renewalDate,
        amount: updateUserSubscriptionDto.amount,
        billingCycle: updateUserSubscriptionDto.billingCycle,
        status:
          updateUserSubscriptionDto.status ?? StatusSubscription['ACTIVE'],
      };

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await this.subscriptionsService.update(
          newUserSubscription.subscriptionId,
          {
            name: updateUserSubscriptionDto.subscriptionName,
            category: updateUserSubscriptionDto.subscription.category,
            icon_name: updateUserSubscriptionDto.subscription.icon_name,
          },
        ); // TODO :  UPDATE THIS SERVICE, it's  a mock for now

        await this.userSubscriptionRepository.update(id, newUserSubscription);
      } catch (err) {
        console.log('error updating user-sub', err);
        // since we have errors lets rollback the changes we made
        await queryRunner.rollbackTransaction();
      } finally {
        // you need to release a queryRunner which was manually instantiated
        await queryRunner.release();
      }

      return `Updated successfully user-subscription`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating user-subscription',
        { cause: error },
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} userSubscription`;
  }
}
