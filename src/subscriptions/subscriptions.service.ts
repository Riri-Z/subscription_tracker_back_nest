import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      return await this.subscriptionRepository.save(createSubscriptionDto);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('this name already exists');
      }
      throw new InternalServerErrorException(
        'Error creating new subscription',
        {
          cause: error,
        },
      );
    }
  }

  findAll() {
    return `This action returns all subscriptions`;
  }

  async findOneById(id: number) {
    return await this.subscriptionRepository.findOneBy({ id });
  }

  async findByName(name: string) {
    return await this.subscriptionRepository.findOneBy({ name });
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    try {
      const currentSubscription = await this.subscriptionRepository.findOneBy({
        id,
      });
      if (!currentSubscription) {
        throw new ConflictException('Subscription not found');
      }
      return await this.subscriptionRepository.update(
        id,
        updateSubscriptionDto,
      );
    } catch (err) {
      throw new InternalServerErrorException(
        'Error updating subscription',
        err,
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}
