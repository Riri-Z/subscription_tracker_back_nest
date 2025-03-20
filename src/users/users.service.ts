import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { UserRole } from './enums/UserRole';
import { HashService } from 'src/shared/utils/hash.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import { jwtConstants } from 'src/auth/constants';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    // Circular dependency: we need to use forwardRef injection here and in both module files to tell NestJS how to resolve this cyclical relationship
    @Inject(forwardRef(() => AuthService))
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = new User();
      user.roles = this.validateRole(createUserDto.roles);
      user.email = createUserDto.email;
      user.activeResetId = null;

      user.password = await this.hashService.hashPassword(
        createUserDto.password,
      );
      user.username = createUserDto.username;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Code PostgreSQL for violation constraint
      if (error.code === '23505') {
        throw new ConflictException('Username or email already exists');
      }
      throw new InternalServerErrorException('Error creating new user', {
        cause: error,
      });
    }
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

  async resetPassword(password: string, token: string) {
    return await this.authService.resetPassword(password, token);
  }

  async requestResetPassword(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) return;

    user.activeResetId = randomUUID(); // Générer un identifiant unique
    const { id, ...userWithoutId } = user;
    await this.update(id, userWithoutId);

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      activeResetId: user.activeResetId,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '20m',
      secret: jwtConstants.secret,
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return await this.mailService.sendResetPassword(email, resetUrl);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.roles) {
        this.validateRole(updateUserDto.roles);
      }

      if (updateUserDto.password) {
        updateUserDto.password = await this.hashService.hashPassword(
          updateUserDto.password,
        );
      }

      const existingUser = await this.userRepository.findOneByOrFail({ id });
      Object.assign(existingUser, updateUserDto);
      return await this.userRepository.save(existingUser);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`id : ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number) {
    const result = await this.userRepository.delete({ id });
    if (result.raw === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
