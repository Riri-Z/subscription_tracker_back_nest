import { Expose, plainToInstance } from 'class-transformer';
import { UserRole } from '../enums/UserRole';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ResponseUserDTO {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  roles: UserRole[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromEntity(user: User): ResponseUserDTO {
    return plainToInstance(ResponseUserDTO, user, {
      excludeExtraneousValues: true,
    });
  }
}
