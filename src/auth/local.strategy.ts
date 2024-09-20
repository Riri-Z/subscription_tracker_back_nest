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

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // this is for local strategy, if we want to implement options , we can add  options objec
    //e.g  : super({ usernameField: 'email' })
    super();
  }

  async validate(username: string, password: string) {
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
