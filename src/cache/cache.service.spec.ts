import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  delete: jest.fn(),
};
describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_INSTANCE',
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add key/value to cache and return true', async () => {
    // given
    const key = 'test_key';
    const value = 'test_value';
    const ttl = '1h';

    // Mock set response
    mockCacheManager.set.mockResolvedValueOnce(true);
    // when
    const resultUpdateCache = await service.set(key, value, ttl);
    // then
    expect(mockCacheManager.set).toHaveBeenLastCalledWith(key, value, ttl);
    expect(resultUpdateCache).toBe(true);
  });
  it('should  return false if an error occurs', async () => {
    // given
    const key = 'test_key';
    const value = 'test_value';
    const ttl = '1h';

    // Mock set response
    mockCacheManager.set.mockRejectedValue(new Error('Redis error'));
    // when
    const resultUpdateCache = await service.set(key, value, ttl);
    // then
    expect(mockCacheManager.set).toHaveBeenLastCalledWith(key, value, ttl);
    expect(resultUpdateCache).toBe(false);
  });
});
