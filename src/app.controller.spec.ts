import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {
  MockUserRepository
} from './users/test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';

describe.only('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, UsersModule],

      controllers: [AppController],
      providers: [AppService],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(MockUserRepository)
      .compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
