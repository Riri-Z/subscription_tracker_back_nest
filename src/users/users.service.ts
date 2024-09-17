import {
  BadRequestException,
  Injectable,
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

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const user = new User();
    const validRoles = this.validateRole(createUserDto.roles);
    user.roles = validRoles;
    user.email = createUserDto.email;
    user.name = createUserDto.name;
    user.password = createUserDto.password;
    user.username = createUserDto.username;
    const { password, updatedAt, deletedAt, ...restProperties } =
      await this.userRepository.save(user);
    return restProperties;
  }

  private validateRole(roles: string[]) {
    /*
    - check if roles est dans enum de role
    */
    const correctRole = roles.filter((role) => UserRole[role] == null);

    if (correctRole.length > 0) {
      throw new BadRequestException('Invalid role(s) provided');
    }

    return roles as UserRole[];
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
