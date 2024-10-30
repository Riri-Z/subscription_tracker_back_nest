import { IsEmail, IsNotEmpty } from 'class-validator';
// Expose properties to swagger module
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/UserRole';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, isArray: true })
  @IsNotEmpty()
  roles: UserRole[];
}
