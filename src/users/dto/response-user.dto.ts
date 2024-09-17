import { Exclude, Expose } from 'class-transformer';
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

  @Exclude()
  password: string;

  @Expose()
  roles: UserRole[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
