import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EntityNotFoundError } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // this is for local strategy, if we want to implement options , we can add  options objec
    //e.g  : super({ usernameField: 'email' })

    super({
      usernameField: 'username', // doit correspondre au champ dans le DTO
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<User> {
    try {
      const user = await this.authService.validateUser(username, password);

      return user;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      throw new UnauthorizedException();
    }
  }
}
