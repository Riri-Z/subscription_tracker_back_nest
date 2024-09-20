import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltOrRounds = 10;

  async hashPassword(password): Promise<string> {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  async comparePassword(hash, providedPassword) {
    const isMatch = await bcrypt.compare(hash, providedPassword);
    return isMatch;
  }
}
