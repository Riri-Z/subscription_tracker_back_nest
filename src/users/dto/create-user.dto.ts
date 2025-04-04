import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Expose properties to swagger module
import { UserRole } from '../enums/UserRole';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  activeResetId: string | null;

  @ApiProperty({ enum: UserRole, isArray: true })
  @IsNotEmpty()
  roles: UserRole[];
}
