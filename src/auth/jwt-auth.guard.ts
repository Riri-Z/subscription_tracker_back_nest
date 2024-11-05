import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const authorization: string | undefined = request?.headers?.authorization;
    const accessToken: string | undefined = request?.cookies?.accessToken;

    if (!accessToken && !authorization) {
      throw new UnauthorizedException('Wrong accessToken');
    }

    request.headers.authorization = accessToken
      ? `Bearer ${accessToken}`
      : authorization;

    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
