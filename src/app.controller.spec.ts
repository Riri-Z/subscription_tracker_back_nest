import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { mockConfigService, MockUserRepository } from './users/test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthService } from './auth/auth.service';
import { ApiResponseService } from './shared/api-response/api-response.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from './shared/utils/hash.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
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
        AuthService,
        ApiResponseService,
        JwtService,
        HashService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
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
