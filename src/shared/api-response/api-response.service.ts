import { Global, Injectable } from '@nestjs/common';
import { ApiResponseDTO } from './api-response.interface';

@Global()
@Injectable()
export class ApiResponseService {
  apiResponse<T>(statusCode: number, body: any = null): ApiResponseDTO<T> {
    return {
      statusCode,
      body,
    };
  }
}
