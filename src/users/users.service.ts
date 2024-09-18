import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './enums/UserRole';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    const validRoles = this.validateRole(createUserDto.roles);
    user.roles = validRoles;
    user.email = createUserDto.email;
    user.name = createUserDto.name;
    user.password = createUserDto.password;
    user.username = createUserDto.username;
    return await this.userRepository.save(user);
  }

  validateRole(roles: string[]) {
    const correctRole = roles.filter((role) => UserRole[role] == null);

    if (correctRole.length > 0) {
      throw new BadRequestException('Invalid role(s) provided');
    }

    return roles as UserRole[];
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneById(id: number) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async findOneByUsername(username: string) {
    return await this.userRepository.findOneByOrFail({ username });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOneByOrFail({ id });
    Object.assign(existingUser, updateUserDto);
    return await this.userRepository.save(existingUser);
  }

  async delete(id: number) {
    const result = await this.userRepository.delete({ id });
    if (result.raw === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
