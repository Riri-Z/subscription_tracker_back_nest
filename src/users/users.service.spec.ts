import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  MockUserRepository,
  ProvidersWithMockDomainRepository,
} from './test/test-utils';
import { ResponseUserDTO } from './dto/response-user.dto';
import { UserRole } from './enums/UserRole';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { afterEach } from 'node:test';
import { User } from './entities/user.entity';

describe('UsersService unit tests', () => {
  let userService: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: ProvidersWithMockDomainRepository([UsersService]),
    }).compile();

    userService = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('Create', () => {
    it('Should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        password: 'password123',
        roles: [UserRole.USER],
      };
      const createdUser = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...createUserDto,
      };

      const expectedResponse: ResponseUserDTO = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        roles: [UserRole.USER],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      //mock save method of the repository
      MockUserRepository.save.mockReturnValue(createdUser);

      jest.spyOn(userService, 'validateRole').mockReturnValue([UserRole.USER]);

      const user = await userService.create(createUserDto);
      expect(MockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(createUserDto),
      );
      expect(user).toEqual(expectedResponse);
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('Should return all users', async () => {
      const mockData: ResponseUserDTO[] = [
        {
          id: 6,
          email: 'test@gmail.com',
          name: 'test',
          username: 'test',
          roles: [UserRole.ADMIN],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(userService, 'findAll').mockResolvedValue(mockData);

      expect(await userService.findAll()).toBe(mockData);
    });
  });
  describe('findOneById', () => {
    it('Should return a user', async () => {
      const userMock: User = {
        id: 13,
        email: 'test@gmail.com',
        name: 'test',
        password: 'test',
        username: 'test',
        roles: [UserRole.ADMIN],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      const { password, deletedAt, ...userResponseMock } = userMock;
      MockUserRepository.findOneByOrFail.mockReturnValue(userMock);
      const id = 13;
      const user = await userService.findOneById(id);
      expect(MockUserRepository.findOneByOrFail).toHaveBeenCalledWith({ id });
      expect(user).toEqual(userResponseMock);
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('Should return updated user', async () => {
      const role = [UserRole.ADMIN];
      const id = 99;

      const updateUserBodyDto: UpdateUserDto = {
        name: 'newName',

        roles: role,
      };

      const mockResult: ResponseUserDTO = {
        id,
        email: 'test@gmail.com',
        name: 'newName',
        username: 'test',
        roles: [UserRole.ADMIN],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const existingUser: User = {
        id,
        email: 'test@gmail.com',
        name: 'test',
        password: 'test',
        username: 'test',
        roles: [UserRole.ADMIN],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      MockUserRepository.findOneByOrFail.mockReturnValue(existingUser);

      Object.assign(existingUser, updateUserBodyDto);
      MockUserRepository.save.mockReturnValue(existingUser);

      const user = await userService.update(id, updateUserBodyDto);

      expect(MockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(existingUser),
      );
      expect(user).toEqual(mockResult);

      expect(user).not.toHaveProperty('password');
    });
  });
});
