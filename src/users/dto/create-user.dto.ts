import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRole } from '../enums/UserRole';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  roles: UserRole[];
}
