import { Test, TestingModule } from '@nestjs/testing';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';

const mockCacheService = {
  get: jest.fn(),
  resetStore: jest.fn(),
};

describe('CacheController', () => {
  let controller: CacheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheController],
      providers: [{ provide: CacheService, useValue: mockCacheService }],
    }).compile();

    controller = module.get<CacheController>(CacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call resetStore', async () => {
    //when
    await controller.clearCache();

    //then
    expect(mockCacheService.resetStore).toHaveBeenCalled();
  });

  it('should return a value', async () => {
    //given
    const key = 'fake_key';
    const value = 'fake_value';
    mockCacheService.get.mockResolvedValue(value);

    //when
    const res = await controller.getSpecifickey(key);

    //then
    expect(mockCacheService.get).toHaveBeenCalled();
    expect(res).toBe(value);
  });
});
