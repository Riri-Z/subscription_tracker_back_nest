import { UserRole } from '../enums/UserRole';

export class CreateUserDto {
  name: string;
  username: string;
  password: string;
  email: string;
  roles: UserRole[];
}
