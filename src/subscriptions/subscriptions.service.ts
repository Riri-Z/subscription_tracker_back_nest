import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { IsNull, Not, Repository } from 'typeorm';

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
  async findAllWithIcons() {
    const result = await this.subscriptionRepository.find({
      where: {
        icon_url: Not(IsNull()),
      },
    });

    return result;
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

  /**
   * Generate icon_url property based on subscription.name and update icon url
   * for the given subscription.
   * It call iconExistsOnCDN method, and set the right url for icon_url property
   * @param subscription Subscription
   * @returns Subscription
   */
  async updateSubscriptionIconUrl(subscription: Subscription) {
    if (!subscription?.name) {
      return subscription;
    }
    try {
      // TODO : Maybe use cache to prevent  multiple  call http
      const iconExists = await this.iconExistsOnCDN(subscription.name);

      if (iconExists) {
        subscription.icon_url =
          process.env.CDN_ICONS_BASE +
          '/' +
          subscription.name.toLowerCase() +
          '.svg';
      } else {
        subscription.icon_url = null;
      }

      // save icon url in database
      await this.update(subscription.id, subscription);
      return subscription;
    } catch (error) {
      console.info('Error generating icon url error :', error);
      return subscription;
    }
  }

  /**
   * This methode aims to check icon avalability on CDN for a given  name
   * @param subscriptionName
   * @returns Boolean true / false if icon is available
   */
  async iconExistsOnCDN(subscriptionName: string): Promise<boolean> {
    if (!subscriptionName) {
      return false;
    }
    try {
      const normalizedNamed = subscriptionName.toLowerCase();
      const iconUrl =
        process.env.CDN_ICONS_BASE + '/' + normalizedNamed + '.svg';
      const response = await fetch(iconUrl);
      return response.ok;
    } catch (error) {
      console.info(`${subscriptionName} icon is unavailable: ${error.message}`);
      return false;
    }
  }
}
