import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiResponseService } from 'src/shared/api-response/api-response.service';

describe('AuthController', () => {
  let controller: AuthController;

  const user = {
    username: 'test',
  };
  const tokens = {
    accessToken: 'fake access token',
    refreshToken: 'fake refresh token',
  };
  // we mock each mothode of the controller
  const mockAuthservice = {
    validateUser: jest.fn().mockResolvedValue(user),
    login: jest.fn().mockResolvedValue(tokens),
    logout: jest.fn().mockResolvedValue('User  has been log out'),
    getTokens: jest.fn().mockResolvedValue(tokens),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],

      providers: [
        {
          provide: AuthService,
          useValue: { mockAuthservice },
        },
        {
          provide: ApiResponseService,
          useValue: {},
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
