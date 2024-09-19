import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response/api-response.service';

@Module({
  providers: [ApiResponseService],
  exports: [ApiResponseService],
})
export class SharedModule {}
