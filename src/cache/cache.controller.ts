import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CacheService } from './cache.service';
import { AdminGuard } from 'src/auth/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('cache')
export class CacheController {
  constructor(private readonly service: CacheService) {}

  // Route to reset redis store
  @Delete('reset')
  @HttpCode(HttpStatus.OK)
  async clearCache() {
    await this.service.resetStore();

    return 'cache has been cleared';
  }

  @Get(':key')
  @HttpCode(HttpStatus.OK)
  async getSpecifickey(@Param('key') key: string) {
    return await this.service.get(key);
  }
}
