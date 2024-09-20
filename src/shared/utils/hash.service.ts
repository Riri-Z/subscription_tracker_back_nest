import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltOrRounds = 10;

  async hashPassword(password): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltOrRounds);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error hashing password, error :',
        { cause: error },
      );
    }
  }

  async comparePassword(hash, providedPassword) {
    try {
      const isMatch = await bcrypt.compare(hash, providedPassword);
      return isMatch;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error comparing password and hash, error : ',
        { cause: error },
      );
    }
  }
}
