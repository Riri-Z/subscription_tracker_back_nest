import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';

const mockResolvedValueFindAllWithIcons = [
  {
    id: 108,
    name: 'netflix',
    icon_name: null,
    icon_url: 'https://pub-mock.r2.dev/netflix.svg',
  },
  {
    id: 58,
    name: 'basic-fit',
    icon_name: null,
    icon_url: 'https://pub-mock.r2.dev/basic-fit.svg',
  },
];
describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  const MockSubscriptionRepository = {
    find: jest.fn().mockResolvedValue(mockResolvedValueFindAllWithIcons),
    findOneBy: jest.fn().mockResolvedValue(null),
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
    // GIVEN
    const repositorySpy = jest.spyOn(MockSubscriptionRepository, 'save');
    const data: CreateSubscriptionDto = { name: 'netflix' };

    // WHEN
    const response = await service.create(data);

    // THEN
    expect(repositorySpy).toHaveBeenCalledWith(data);
    expect(response).toEqual(data);
  });

  it('should throw an error if save fails', async () => {
    // GIVEN
    const repositorySpy = jest.spyOn(MockSubscriptionRepository, 'save');
    repositorySpy.mockRejectedValue(
      new Error('Error creating new subscription'),
    );

    // WHEN / THEN
    expect(service.create({ name: 'netflix' })).rejects.toThrow(
      'Error creating new subscription',
    );
  });

  it('should throw an conflictException if name already exists', async () => {
    // Given
    const repositorySpy = jest.spyOn(MockSubscriptionRepository, 'save');

    repositorySpy.mockRejectedValue({ code: '23505' });

    // When/Then
    expect(service.create({ name: 'netflix' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('findAllWithIcons', async () => {
    // GIVEN
    const repositorySpy = jest.spyOn(MockSubscriptionRepository, 'find');
    // WHEN
    const response = await service.findAllWithIcons();
    // THEN
    expect(repositorySpy).toHaveBeenCalled();
    expect(response).toEqual(mockResolvedValueFindAllWithIcons);
  });

  it('should throw an EntitynotFoundError if subscription with given id doesn"t exists', async () => {
    // GIVEN
    jest
      .spyOn(MockSubscriptionRepository, 'findOneByOrFail')
      .mockRejectedValue(new EntityNotFoundError(Subscription, { id: 1 }));

    // WHEN/THEN
    await expect(service.findOneById(1)).rejects.toThrow();
  });

  it('should update subscription and call getIconUrl', async () => {
    // GIVEN
    jest
      .spyOn(MockSubscriptionRepository, 'findOneBy')
      .mockResolvedValue({ id: 1, name: 'netflix' });
    const getIconSpy = jest
      .spyOn(service, 'getIconUrl')
      .mockResolvedValue(null);
    jest
      .spyOn(MockSubscriptionRepository, 'update')
      .mockResolvedValue({ affected: 1 });

    // WHEN
    const updatedSubscription = await service.update(1, { name: 'newName' });

    // THEN
    expect(updatedSubscription.affected).toEqual(1);
    expect(getIconSpy).toHaveBeenCalledWith('newName');
  });
  it('should throw NotFoundException', async () => {
    // GIVEN
    jest.spyOn(MockSubscriptionRepository, 'findOneBy').mockResolvedValue(null);

    // WHEN / THEN
    await expect(service.update(1, {})).rejects.toThrow(
      new NotFoundException('Subscription not found'),
    );
  });
  it('should throw InternalServerErrorException', async () => {
    // GIVEN
    jest
      .spyOn(MockSubscriptionRepository, 'findOneBy')
      .mockRejectedValue(
        new InternalServerErrorException('Error updating subscription'),
      );

    // WHEN / THEN
    await expect(service.update(1, {})).rejects.toThrow(
      'Error updating subscription',
    );
  });
});
