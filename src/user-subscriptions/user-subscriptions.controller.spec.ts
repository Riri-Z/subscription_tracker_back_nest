import { Test, TestingModule } from '@nestjs/testing';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { UserSubscriptionsService } from './user-subscriptions.service';

describe('UserSubscriptionsController', () => {
  let controller: UserSubscriptionsController;
  let service: UserSubscriptionsService;

  const mockUserSubscriptionsService = {
    create: jest.fn().mockReturnValue(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSubscriptionsController],
      providers: [{ provide: UserSubscriptionsService, useValue: {} }],
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
