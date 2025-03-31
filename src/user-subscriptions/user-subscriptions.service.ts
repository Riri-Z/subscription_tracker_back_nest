import {
  BadRequestException,
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
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class UserSubscriptionsService {
  constructor(
    @InjectRepository(UserSubscriptions)
    private readonly userSubscriptionRepository: Repository<UserSubscriptions>,
    private readonly cacheService: CacheService,
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
          category: createUserSubscriptionDto.category,
          amount: createUserSubscriptionDto.amount,
          billingCycle: createUserSubscriptionDto.billingCycle,
          status:
            createUserSubscriptionDto.status ?? StatusSubscription['ACTIVE'],
        });
      console.info(
        'new subscription :',
        createUserSubscriptionDto.subscriptionName,
        'has been add to user :',
        createdUserSubscription.userId,
      );
      // Clear cache user
      await this.invalidCacheUser(createUserSubscriptionDto.userId);

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

  // Clear the cache for userSubscriptionByMonth_ based on the given userID
  async invalidCacheUser(userId: number) {
    const cacheUserSubscriptionStore = `userSubscriptionByMonth_${userId}`;
    // Fetch array of keys cached userSubscription for given userId
    const cachedKeys: unknown = await this.cacheService.get(
      cacheUserSubscriptionStore,
    );
    if (Array.isArray(cachedKeys)) {
      for (const key of cachedKeys) {
        // Delete each  to clean redisStore
        await this.cacheService.delete(key);
      }
      await this.cacheService.delete(cacheUserSubscriptionStore);
    }
  }

  /**
   * Get active subscription for a given month
   * @param date start of the month
   * @param userId
   * @returns userSubscriptions[]
   */
  async findActiveSubscriptionByMonth(date: string, userId: number) {
    try {
      const endDate: Date = dayjs(date).isValid()
        ? dayjs(date).endOf('month').toDate()
        : null;
      if (!endDate) {
        throw new BadRequestException('Invalid date format');
      }
      const cacheKey = `userSubscriptionByMonth_${date}_${userId}` as const;

      // Return cacheData if present
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData && Object.keys(cachedData).length > 0) {
        return cachedData;
      }

      // Retreive userSubscriptions
      const userSubscriptions = await this.userSubscriptionRepository.find({
        relations: { subscription: true },
        where: {
          userId,
          status: StatusSubscription['ACTIVE'],
          startDate: LessThan(endDate),
        },
      });

      if (userSubscriptions.length === 0) {
        console.info(
          `No userSubscriptions found for the following userID and date :  ${userId},   ${date}`,
        );
        return [];
      } else {
        // Add additional information and forecast  payements
        const processedUserSubscriptions = await this.processUserSubscriptions(
          userSubscriptions,
          endDate,
        );

        // Save in cache
        await this.cacheService.set(cacheKey, processedUserSubscriptions);

        // Update list user keys cache
        const cacheUserSubscriptionStore =
          `userSubscriptionByMonth_${userId}` as const;

        const currentCacheUserSubscription =
          (await this.cacheService.get(cacheUserSubscriptionStore)) ?? [];

        if (
          //check if the user data is not already present in user store
          Array.isArray(currentCacheUserSubscription) &&
          !currentCacheUserSubscription.includes(cacheUserSubscriptionStore)
        ) {
          currentCacheUserSubscription.push(cacheKey);

          // Save data to cache
          await this.cacheService.set(
            cacheUserSubscriptionStore,
            currentCacheUserSubscription,
          );
        }
        return processedUserSubscriptions;
      }
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
   * Populate userSubscriptions with their payement's forecast and their subscription's icon url
   * @param userSubscriptions: UserSubscriptions[]
   * @param endDate : Date
   * @returns
   */
  async processUserSubscriptions(
    userSubscriptions: UserSubscriptions[],
    endDate: Date,
  ) {
    const userSubscriptionsWithIcons = await Promise.all(
      userSubscriptions.map(async (userSubscriptions: UserSubscriptions) => {
        try {
          if (!userSubscriptions.subscription.icon_url) {
            userSubscriptions.subscription =
              await this.subscriptionsService.updateSubscriptionIconUrl(
                userSubscriptions.subscription,
              );
          }
        } catch (error) {
          console.error(
            `error generating icon URL for subscription : ${error.message}`,
          );
          userSubscriptions.subscription.icon_url = null; // Fallback to null in case of error
        }
        return userSubscriptions;
      }),
    );
    return this.getPaymentDatesForSubscription(
      userSubscriptionsWithIcons,
      endDate,
    );
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
    const paymentDates: Date[] = [];
    let currentDate = dayjs(startDate);

    while (currentDate.isBefore(dayjs(targetDate))) {
      // check if date payement is in the targeted month
      if (this.isInTargetPeriod(currentDate, targetDate, startDate)) {
        paymentDates.push(currentDate.toDate());
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
      let subscriptionId: number | null = null;

      const subscription = await this.subscriptionsService.findByName(
        updateUserSubscriptionDto.subscriptionName,
      );
      if (!subscription) {
        // Create new subscription  with the new name, therefor we have an id to update the user subscription
        const responseNewSubscription = await this.subscriptionsService.create({
          name: updateUserSubscriptionDto.subscriptionName,
        });
        subscriptionId = responseNewSubscription.id;
      } else {
        subscriptionId = subscription.id;
      }

      // TODO : check if newUserSubscription is complete. if not throw an error
      const newUserSubscription: Partial<UserSubscriptions> = {
        id: updateUserSubscriptionDto.id,
        userId: updateUserSubscriptionDto.userId,
        subscriptionId,
        startDate: updateUserSubscriptionDto.startDate,
        endDate: updateUserSubscriptionDto.endDate,
        renewalDate: updateUserSubscriptionDto.renewalDate,
        amount: updateUserSubscriptionDto.amount,
        category: updateUserSubscriptionDto.category,
        billingCycle: updateUserSubscriptionDto.billingCycle,
        status:
          updateUserSubscriptionDto.status ?? StatusSubscription['ACTIVE'],
      };

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await this.userSubscriptionRepository.update(id, newUserSubscription);
      } catch (err) {
        console.log('error updating user-sub', err);
        // since we have errors lets rollback the changes we made
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(
          'Error updating user-subscription',
          { cause: err },
        );
      } finally {
        // you need to release a queryRunner which was manually instantiated
        await queryRunner.release();
      }
      await this.invalidCacheUser(updateUserSubscriptionDto.userId);
      return `Updated successfully user-subscription`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating user-subscription',
        { cause: error },
      );
    }
  }

  async remove(id: number, userId) {
    try {
      const result = await this.userSubscriptionRepository.delete({ id });
      if (result.affected > 0) {
        await this.invalidCacheUser(userId);
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting user-subscription id: ' + id,
        { cause: error },
      );
    }
  }
}
