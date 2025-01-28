import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { ApiResponseService } from 'src/shared/api-response/api-response.service';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;

  const mockUserSubscriptionsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: mockUserSubscriptionsService,
        },
        {
          provide: ApiResponseService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
