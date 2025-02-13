import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashService } from 'src/shared/utils/hash.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly configService: ConfigService,
  ) {}

  validateUser = async (username: string, password: string): Promise<User> => {
    try {
      const user = await this.userService.findOneByUsername(username);
      const isMatchPassword = await this.hashService.comparePassword(
        user.password,
        password,
      );
      if (user && isMatchPassword) {
        delete user.password;
        return user;
      }

      return null;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user', {
        cause: error,
      });
    }
  };

  async login(user: User) {
    try {
      const { accessToken, refreshToken } = await this.getTokens(
        user.id,
        user.username,
      );
      const {
        createdAt,
        updatedAt,
        deletedAt,
        password,
        ...userWithoutConfidentialData
      } = user;
      return { accessToken, refreshToken, userWithoutConfidentialData };
    } catch (error) {
      throw new InternalServerErrorException('Error login user', {
        cause: error,
      });
    }
  }

  async logout(user: JwtPayload): Promise<string> {
    return 'User  has been log out';
  }

  async getTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '2h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
