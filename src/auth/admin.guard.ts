import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/users/enums/UserRole';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    if (!user?.roles.includes(UserRole.ADMIN)) {
      throw new UnauthorizedException(
        'You are not authorized to access the resource',
      );
    }

    return user;
  }
}
