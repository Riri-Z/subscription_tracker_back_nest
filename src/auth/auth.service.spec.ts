import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockMailService, MockUserRepository } from '../users/test/test-utils';
import { User } from '../users/entities/user.entity';
import { HashService } from 'src/shared/utils/hash.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

describe('AuthService', () => {
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        HashService,
        ConfigService,
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: MockUserRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
