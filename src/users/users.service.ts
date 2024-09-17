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
import { ResponseUserDTO } from './dto/response-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDTO> {
    const user = new User();
    const validRoles = this.validateRole(createUserDto.roles);
    user.roles = validRoles;
    user.email = createUserDto.email;
    user.name = createUserDto.name;
    user.password = createUserDto.password;
    user.username = createUserDto.username;
    const savedUser = await this.userRepository.save(user);
    return new ResponseUserDTO(savedUser);
  }

  private validateRole(roles: string[]) {
    const correctRole = roles.filter((role) => UserRole[role] == null);

    if (correctRole.length > 0) {
      throw new BadRequestException('Invalid role(s) provided');
    }

    return roles as UserRole[];
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });
    return new ResponseUserDTO(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOneByOrFail({ id });
    Object.assign(existingUser, updateUserDto);
    await this.userRepository.save(existingUser);
    return new ResponseUserDTO(existingUser);
  }

  async delete(id: number) {
    const result = await this.userRepository.delete({ id });
    if (result.raw === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
