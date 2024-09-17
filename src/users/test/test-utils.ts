import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Provider } from '@nestjs/common';

const MockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Surcharge provider with mockRepository
export const ProvidersWithMockDomainRepository = (providers: Provider[]) => {
  return [
    ...providers,
    {
      provide: getRepositoryToken(User),
      useValue: MockUserRepository,
    },
  ];
};
