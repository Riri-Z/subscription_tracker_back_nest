import { Expose, plainToInstance } from 'class-transformer';
import { UserRole } from '../enums/UserRole';
import { User } from '../entities/user.entity';

export class ResponseUserDTO {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  username: string;

  @Expose()
  roles: UserRole[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(user: User): ResponseUserDTO {
    return plainToInstance(ResponseUserDTO, user, {
      excludeExtraneousValues: true,
    });
  }
}
