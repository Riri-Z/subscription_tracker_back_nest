import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  const MockSubscriptionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn().mockResolvedValue({ name: 'netflix' }),
    update: jest.fn(),
    delete: jest.fn(),
    findOneByOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(Subscription), //inject mock without the need of @InjectReepository(Entity) , and allow to tests without ddb connexion
          useValue: MockSubscriptionRepository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async () => {
    const repositorySpy = jest.spyOn(MockSubscriptionRepository, 'save');

    const data: CreateSubscriptionDto = { name: 'netflix' };

    const response = await service.create(data);

    expect(repositorySpy).toHaveBeenCalled();

    expect(response).toEqual(data);
  });
});
