import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response/api-response.service';
import { HashService } from './utils/hash.service';

@Module({
  providers: [ApiResponseService, HashService],
  exports: [ApiResponseService, HashService],
})
export class SharedModule {}
