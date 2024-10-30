import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashService } from 'src/shared/utils/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  validateUser = async (username: string, password: string) => {
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
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error login user', {
        cause: error,
      });
    }
  }

  async logout(req) {
    console.log('log out user : ', req);
    return 'User  has been log out';
  }
}
