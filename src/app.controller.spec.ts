import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import {
  mockConfigService,
  mockJwtService,
  mockMailService,
  MockUserRepository,
} from './users/test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthService } from './auth/auth.service';
import { ApiResponseService } from './shared/api-response/api-response.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from './shared/utils/hash.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail/mail.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        SharedModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              jwt: {
                secret: 'test-secret',
                expiresIn: '1h',
              },
            }),
          ],
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        JwtService,

        ApiResponseService,
        JwtService,
        HashService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(MockUserRepository)
      .compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('expect getHello service', () => {
      const authSpy = jest.spyOn(appService, 'getHello');
      appController.getHello();
      expect(authSpy).toHaveBeenCalled();
    });
  });
});
