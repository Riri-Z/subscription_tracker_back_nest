import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CacheModule } from './cache.module';
import { CacheService } from './cache.service';

import { INestApplication } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

describe('Cache', () => {
  let app: INestApplication;
  const cacheService = {
    get: () => 'ok',
    resetStore: () => 'cache has been cleared',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(CacheService)
      .useValue(cacheService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('get value', () => {
    return request(app.getHttpServer())
      .get('/cache/userSubscriptionByMonth_2025-03-20_84')
      .expect(200)
      .expect(cacheService.get());
  });

  it('clear redis', () => {
    return request(app.getHttpServer())
      .delete('/cache/reset')
      .expect(200)
      .expect(cacheService.resetStore());
  });

  it('should return 500 on error', () => {
    jest.spyOn(cacheService, 'get').mockImplementationOnce(() => {
      throw new Error('error');
    });

    return request(app.getHttpServer())
      .get('/cache/userSubscriptionByMonth_2025-03-20_84')
      .expect(500)
      .expect((response) => {
        console.log({ response });
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Internal server error');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
