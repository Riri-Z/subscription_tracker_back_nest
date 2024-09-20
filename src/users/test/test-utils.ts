import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Provider } from '@nestjs/common';

export const MockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findOneByOrFail: jest.fn(),
};

// Mock pour HashService
export const mockHashService = {
  hashPassword: jest.fn().mockResolvedValue('hashPassword'),
  comparePassword: jest.fn().mockResolvedValue(true),
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
