import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { Between, Repository } from 'typeorm';
import { UserSubscriptions } from './entities/user-subscription.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';

@Injectable()
export class UserSubscriptionsService {
  constructor(
    @InjectRepository(UserSubscriptions)
    private readonly userSubscriptionRepository: Repository<UserSubscriptions>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(createUserSubscriptionDto: CreateUserSubscriptionDto) {
    try {
      const subscription = await this.subscriptionsService.findByName(
        createUserSubscriptionDto.subscriptionName,
      );

      const subscriptionId = subscription
        ? subscription.id
        : await this.subscriptionsService
            .create({
              name: createUserSubscriptionDto.subscriptionName,
              category: createUserSubscriptionDto?.subscriptionCategory,
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
          status: createUserSubscriptionDto.status,
        });

      return createdUserSubscription;
    } catch (error) {
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

  async findByMonth(date: string, userId: number) {
    try {
      const startDate = dayjs(date).startOf('month').toDate();
      const endDate = dayjs(date).endOf('month').toDate();
      const subscriptions = await this.userSubscriptionRepository.find({
        relations: { subscription: true },
        where: { userId, renewalDate: Between(startDate, endDate) },
      });

      if (subscriptions.length === 0) {
        console.log(
          `No subscriptions found for the following userID and date :  ${userId},   ${date}`,
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

  findOne(id: number) {
    return `This action returns a #${id} userSubscription`;
  }

  update(id: number, updateUserSubscriptionDto: UpdateUserSubscriptionDto) {
    return `This action updates a #${id} userSubscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} userSubscription`;
  }
}
