import { Test, TestingModule } from '@nestjs/testing';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { UserSubscriptionsService } from './user-subscriptions.service';

describe('UserSubscriptionsController', () => {
  let controller: UserSubscriptionsController;

  const mockUserSubscriptionsService = {
    create: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSubscriptionsController],
      providers: [
        {
          provide: UserSubscriptionsService,
          useValue: mockUserSubscriptionsService,
        },
      ],
    }).compile();

    controller = module.get<UserSubscriptionsController>(
      UserSubscriptionsController,
    );

    service = module.get<UserSubscriptionsService>(UserSubscriptionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
