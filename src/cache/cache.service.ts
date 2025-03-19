import { Inject, Injectable } from '@nestjs/common';
import { Cacheable } from 'cacheable';

@Injectable()
export class CacheService {
  constructor(@Inject('CACHE_INSTANCE') private readonly cache: Cacheable) {}

  async get(key: string): Promise<any> {
    try {
      return await this.cache.get(key);
    } catch (error) {
      console.log('error', error);
      return undefined;
    }
  }

  async set(key: string, value: any, ttl?: number | string): Promise<boolean> {
    try {
      return await this.cache.set(key, value, ttl);
    } catch (error) {
      console.error('error setting value for : ', key, 'error : ', error);
      return false;
    }
  }

  async resetStore() {
    return await this.cache.clear();
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }
}
