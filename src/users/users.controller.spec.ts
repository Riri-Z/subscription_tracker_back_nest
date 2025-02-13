import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ApiResponseService } from 'src/shared/api-response/api-response.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUserService = {
    create: jest.fn().mockReturnValue({
      username: 'testtest',
      password: 'aaaaada',
      email: 'testtest@gmail.com',
      roles: ['ADMIN'],
    }),
    findAll: jest.fn().mockReturnValue([
      {
        id: 31,
        email: 'pzqodpqzodpzq@gmail.com',

        username: 'pzqodpqzodpzq',
        roles: ['ADMIN'],
        createdAt: '2024-09-20T06:49:54.013Z',
        updatedAt: '2024-09-20T06:49:54.013Z',
      },
      {
        id: 32,
        email: 'testtest@gmail.com',

        username: 'testtest',
        roles: ['ADMIN'],
        createdAt: '2024-09-20T07:28:06.465Z',
        updatedAt: '2024-09-20T07:28:06.465Z',
      },
      {
        id: 33,
        email: 'xxx@gmail.com',

        username: 'xxx',
        roles: ['USER'],
        createdAt: '2024-09-23T06:49:56.388Z',
        updatedAt: '2024-09-23T06:49:56.388Z',
      },
    ]),
    findOneById: jest.fn().mockReturnValue({
      id: 31,
      email: 'pzqodpqzodpzq@gmail.com',

      username: 'pzqodpqzodpzq',
      roles: ['ADMIN'],
      createdAt: '2024-09-20T06:49:54.013Z',
      updatedAt: '2024-09-20T06:49:54.013Z',
    }),
    findOneByUsername: jest.fn().mockReturnValue({
      id: 31,
      email: 'pzqodpqzodpzq@gmail.com',

      username: 'pzqodpqzodpzq',
      roles: ['ADMIN'],
      createdAt: '2024-09-20T06:49:54.013Z',
      updatedAt: '2024-09-20T06:49:54.013Z',
    }),
    update: jest.fn().mockReturnValue({
      id: 31,
      email: 'pzqodpqzodpzq@gmail.com',

      username: 'pzqodpqzodpzq',
      roles: ['ADMIN'],
      createdAt: '2024-09-20T06:49:54.013Z',
      updatedAt: '2024-09-20T06:49:54.013Z',
    }),
    delete: jest.fn(
      (id: number) => `Utilisateur avec l'id ${id} a été supprimé avec succès`,
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        ApiResponseService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/get users', async () => {
    const result = {
      body: [
        {
          createdAt: '2024-09-20T06:49:54.013Z',
          email: 'pzqodpqzodpzq@gmail.com',
          id: 31,
          roles: ['ADMIN'],
          updatedAt: '2024-09-20T06:49:54.013Z',
          username: 'pzqodpqzodpzq',
        },
        {
          createdAt: '2024-09-20T07:28:06.465Z',
          email: 'testtest@gmail.com',
          id: 32,
          roles: ['ADMIN'],
          updatedAt: '2024-09-20T07:28:06.465Z',
          username: 'testtest',
        },
        {
          createdAt: '2024-09-23T06:49:56.388Z',
          email: 'xxx@gmail.com',
          id: 33,
          roles: ['USER'],
          updatedAt: '2024-09-23T06:49:56.388Z',
          username: 'xxx',
        },
      ],
      statusCode: 200,
    };
    const serviceSpy = jest.spyOn(usersService, 'findAll');

    expect(await controller.findAll()).toEqual(result);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it('findOneById', async () => {
    const id = 31;
    const response = await controller.findOneById(id);
    const serviceSpy = jest.spyOn(usersService, 'findOneById');
    const expectedResult = {
      body: mockUserService.findOneById(id),
      statusCode: 200,
    };
    expect(response).toEqual(expectedResult);
    expect(serviceSpy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalledWith(id);
  });
});
