import { Module } from '@nestjs/common';
import { Cacheable } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

@Module({
  providers: [
    {
      provide: 'CACHE_INSTANCE',
      useFactory: () => {
        console.log('Connecting to Redis at:', process.env.REDIS_SOCKET_HOST);

        const redisStore = createKeyv(process.env.REDIS_URL);

        redisStore.on('error', (err) => {
          console.error('Redis connection error:', err);
        });
        return new Cacheable({ secondary: redisStore, ttl: '1h' });
      },
    },
    CacheService,
  ],
  exports: ['CACHE_INSTANCE', CacheService],
  controllers: [CacheController],
})
export class CacheModule {}
