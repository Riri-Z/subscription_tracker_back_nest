import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CacheService } from './cache.service';
import { AdminGuard } from 'src/auth/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('cache')
export class CacheController {
  constructor(private readonly service: CacheService) {}
  // Route pour réinitialiser le cache Redis
  @Delete('reset')
  @HttpCode(HttpStatus.OK)
  async clearCache() {
    await this.service.resetStore();

    return 'cache has been cleared';
  }
}
