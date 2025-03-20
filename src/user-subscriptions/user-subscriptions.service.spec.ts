import { Test, TestingModule } from '@nestjs/testing';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserSubscriptions } from './entities/user-subscription.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { DataSource } from 'typeorm';
import { CacheService } from 'src/cache/cache.service';
// TODO : COMPLETE THOSE TESTS
describe('UserSubscriptionsService', () => {
  let service: UserSubscriptionsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSubscriptionsService,
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserSubscriptions),
          useValue: {},
        },
        {
          provide: SubscriptionsService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserSubscriptionsService>(UserSubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
