import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  MockUserRepository,
  mockHashService,
  ProvidersWithMockDomainRepository,
  mockMailService,
  mockJwtService,
} from './test/test-utils';
import { UserRole } from './enums/UserRole';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { afterEach } from 'node:test';
import { User } from './entities/user.entity';
import { HashService } from '../shared/utils/hash.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

describe('UsersService unit tests', () => {
  let userService: UsersService;
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: ProvidersWithMockDomainRepository([
        UsersService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
      ]),
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
      //Body
      const createUserDto: CreateUserDto = {
        email: 'user3@gmail.com',
        activeResetId: null,
        username: 'user3',
        password: 'testPassword',
        roles: [UserRole.ADMIN],
      };
      //Return after repository save()
      const createdUser = {
        id: 3,
        email: 'user3@gmail.com',
        activeResetId: null,
        username: 'user3',
        password: 'hashPassword',
        roles: [UserRole.ADMIN],
        createdAt: new Date('2024-09-18T09:40:04.345Z'),
        updatedAt: new Date('2024-09-18T09:40:04.345Z'),
        deletedAt: null,
      };

      const expectedResponse: User = {
        id: 3,
        email: 'user3@gmail.com',
        activeResetId: null,
        username: 'user3',
        password: 'hashPassword',
        roles: [UserRole.ADMIN],
        createdAt: new Date('2024-09-18T09:40:04.345Z'),
        updatedAt: new Date('2024-09-18T09:40:04.345Z'),
        deletedAt: null,
      };

      const hashPassword = 'hashPassword';
      //mock save method of the repository
      MockUserRepository.save.mockReturnValue(createdUser);

      jest.spyOn(userService, 'validateRole').mockReturnValue([UserRole.ADMIN]);

      const user = await userService.create(createUserDto);
      expect(mockHashService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      createUserDto.password = hashPassword;
      expect(MockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(createUserDto),
      );
      expect(user).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('Should return all users', async () => {
      const mockData: User[] = [
        {
          id: 6,
          email: 'test@gmail.com',
          activeResetId: null,

          username: 'test',
          password: 'testPassword',
          roles: [UserRole.ADMIN],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 3,
          email: 'user3@gmail.com',
          activeResetId: null,

          username: 'user3',
          password: 'testPassword',
          roles: [UserRole.ADMIN],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
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
        activeResetId: null,

        password: 'test',
        username: 'test',
        roles: [UserRole.ADMIN],
        createdAt: new Date('2024-09-18T09:40:04.345Z'),
        updatedAt: new Date('2024-09-18T09:40:04.345Z'),
        deletedAt: null,
      };

      MockUserRepository.findOneByOrFail.mockReturnValue(userMock);
      const id = 13;
      const user = await userService.findOneById(id);
      expect(MockUserRepository.findOneByOrFail).toHaveBeenCalledWith({ id });
      expect(user).toEqual(userMock);
    });
  });

  describe('update', () => {
    it('Should return updated user', async () => {
      const role = [UserRole.ADMIN];
      const id = 99;

      const updateUserBodyDto: UpdateUserDto = {
        roles: role,
      };

      const mockResult: User = {
        id,
        email: 'test@gmail.com',
        activeResetId: null,

        username: 'test',
        password: 'test',
        roles: [UserRole.ADMIN],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const existingUser: User = {
        id,
        email: 'test@gmail.com',
        activeResetId: null,

        password: 'test',
        username: 'test',
        roles: [UserRole.USER],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      MockUserRepository.findOneByOrFail.mockReturnValue(existingUser);

      const existingUserUpdated = Object.assign(
        existingUser,
        updateUserBodyDto,
      );

      MockUserRepository.save.mockReturnValue(existingUserUpdated);

      const user = await userService.update(id, updateUserBodyDto);

      expect(MockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(existingUser),
      );
      expect(user).toEqual(mockResult);
    });
  });
});
