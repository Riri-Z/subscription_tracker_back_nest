import { UserRole } from 'src/users/enums/UserRole';

export interface JwtPayload {
  sub: number;
  username: string;
  iat: number;
  exp: number;
  roles: UserRole[];
}
