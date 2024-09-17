import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ProvidersWithMockDomainRepository } from './test/test-utils';
import { ResponseUserDTO } from './dto/response-user.dto';
import { UserRole } from './enums/UserRole';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService unit tests', () => {
  let userService: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: ProvidersWithMockDomainRepository([UsersService]),
    }).compile();

    userService = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
  it('create(), should return created user', async () => {
    const mockBody = {
      id: 1,
      email: 'test@gmail.com',
      name: 'test',
      username: 'test',
      password: 'test',
      roles: [UserRole.ADMIN],
      createdAt: new Date('2024-09-17T10:58:11.728Z'),
      updatedAt: new Date('2024-09-17T10:58:11.728Z'),
    };
    const mockResult = {
      id: 1,
      email: 'test@gmail.com',
      name: 'test',
      username: 'test',
      roles: [UserRole.ADMIN],
      createdAt: new Date('2024-09-17T10:58:11.728Z'),
      updatedAt: new Date('2024-09-17T10:58:11.728Z'),
    };

    jest.spyOn(userService, 'create').mockResolvedValue(mockResult);

    expect(await userService.create(mockBody)).toBe(mockResult);
  });

  it('findAll(), should return all users', async () => {
    const mockData: ResponseUserDTO[] = [
      {
        id: 6,
        email: 'test@gmail.com',
        name: 'test',
        username: 'test',
        roles: [UserRole.ADMIN],
        createdAt: new Date('2024-09-17T10:58:11.728Z'),
        updatedAt: new Date('2024-09-17T10:58:11.728Z'),
      },
    ];
    jest.spyOn(userService, 'findAll').mockResolvedValue(mockData);

    expect(await userService.findAll()).toBe(mockData);
  });
  it('findOne(), should retur a user', async () => {
    const mockData: ResponseUserDTO = {
      id: 13,
      email: 'test@gmail.com',
      name: 'test',
      username: 'test',
      roles: [UserRole.ADMIN],
      createdAt: new Date('2024-09-17T10:58:11.728Z'),
      updatedAt: new Date('2024-09-17T10:58:11.728Z'),
    };
    jest.spyOn(userService, 'findOne').mockResolvedValue(mockData);

    expect(await userService.findOne(mockData.id)).toBe(mockData);
  });

  it('update(), should return updated user', async () => {
    const role = [UserRole.ADMIN];
    const id = 13;


    const mockResult: ResponseUserDTO = {
      id,
      email: 'zaeazez@gmail.com',
      name: 'zaeazez',
      username: 'zaeazez',
      roles: role,
      createdAt: new Date('2024-09-17T10:58:11.728Z'),
      updatedAt: new Date('2024-09-17T10:58:11.728Z'),
    };

    jest.spyOn(userService, 'update').mockResolvedValue(mockResult);

    expect(await userService.update(id, UpdateUserDto)).toBe(mockResult);
  });
});
