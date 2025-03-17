import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiResponseService } from 'src/shared/api-response/api-response.service';
import { EntityNotFoundError } from 'typeorm';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly apiResponseService: ApiResponseService,
  ) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }
  @Get('/with-icons')
  async findAllWithIcons() {
    const result = await this.subscriptionsService.findAllWithIcons();
    return this.apiResponseService.apiResponse(HttpStatus.OK, result);
  }

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const result = await this.subscriptionsService.findOneById(+id);
      return this.apiResponseService.apiResponse(HttpStatus.OK, result);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      } else {
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }
}
