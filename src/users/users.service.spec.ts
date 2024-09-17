import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ProvidersWithMockDomainRepository } from './test/test-utils';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: ProvidersWithMockDomainRepository([UsersService]),
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
