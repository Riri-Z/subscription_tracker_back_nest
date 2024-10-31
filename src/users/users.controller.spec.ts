import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe.only('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUserService = {
    create: jest.fn().mockReturnValue({
      name: 'testtest',
      username: 'testtest',
      password: 'aaaaada',
      email: 'testtest@gmail.com',
      roles: ['ADMIN'],
    }),
    findAll: jest.fn().mockReturnValue([
      {
        id: 31,
        email: 'pzqodpqzodpzq@gmail.com',
        name: 'pzqodpqzodpzq',
        username: 'pzqodpqzodpzq',
        roles: ['ADMIN'],
        createdAt: '2024-09-20T06:49:54.013Z',
        updatedAt: '2024-09-20T06:49:54.013Z',
      },
      {
        id: 32,
        email: 'testtest@gmail.com',
        name: 'testtest',
        username: 'testtest',
        roles: ['ADMIN'],
        createdAt: '2024-09-20T07:28:06.465Z',
        updatedAt: '2024-09-20T07:28:06.465Z',
      },
      {
        id: 33,
        email: 'xxx@gmail.com',
        name: 'xxx',
        username: 'xxx',
        roles: ['USER'],
        createdAt: '2024-09-23T06:49:56.388Z',
        updatedAt: '2024-09-23T06:49:56.388Z',
      },
    ]),
    findOneById: jest.fn().mockReturnValue({
      id: 31,
      email: 'pzqodpqzodpzq@gmail.com',
      name: 'pzqodpqzodpzq',
      username: 'pzqodpqzodpzq',
      roles: ['ADMIN'],
      createdAt: '2024-09-20T06:49:54.013Z',
      updatedAt: '2024-09-20T06:49:54.013Z',
    }),
    findOneByUsername: jest.fn().mockReturnValue({
      id: 31,
      email: 'pzqodpqzodpzq@gmail.com',
      name: 'pzqodpqzodpzq',
      username: 'pzqodpqzodpzq',
      roles: ['ADMIN'],
      createdAt: '2024-09-20T06:49:54.013Z',
      updatedAt: '2024-09-20T06:49:54.013Z',
    }),
    update: jest.fn().mockReturnValue({
      id: 31,
      email: 'pzqodpqzodpzq@gmail.com',
      name: 'pzqodpqzodpzq',
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
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/get users', async () => {
    const result = [
      {
        id: 31,
        email: 'pzqodpqzodpzq@gmail.com',
        name: 'pzqodpqzodpzq',
        username: 'pzqodpqzodpzq',
        roles: ['ADMIN'],
        createdAt: '2024-09-20T06:49:54.013Z',
        updatedAt: '2024-09-20T06:49:54.013Z',
      },
      {
        id: 32,
        email: 'testtest@gmail.com',
        name: 'testtest',
        username: 'testtest',
        roles: ['ADMIN'],
        createdAt: '2024-09-20T07:28:06.465Z',
        updatedAt: '2024-09-20T07:28:06.465Z',
      },
      {
        id: 33,
        email: 'xxx@gmail.com',
        name: 'xxx',
        username: 'xxx',
        roles: ['USER'],
        createdAt: '2024-09-23T06:49:56.388Z',
        updatedAt: '2024-09-23T06:49:56.388Z',
      },
    ];
    const serviceSpy = jest.spyOn(usersService, 'findAll');

    expect(await controller.findAll()).toEqual(result);
    expect(serviceSpy).toHaveBeenCalled();
  });

  it('findOneById', async () => {
    const id = 31;
    const response = await controller.findOneById(id);
    const serviceSpy = jest.spyOn(usersService, 'findOneById');

    expect(response).toEqual(mockUserService.findOneById(id));
    expect(serviceSpy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalledWith(id);
  });
});
