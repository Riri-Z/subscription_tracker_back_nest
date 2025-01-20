import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseService } from 'src/shared/api-response/api-response.service';

@UseGuards(JwtAuthGuard)
@Controller('user-subscriptions')
export class UserSubscriptionsController {
  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
    private readonly apiResponseService: ApiResponseService,
  ) {}

  @ApiBearerAuth('jwt')
  @Post()
  async create(
    @Req() req,
    @Body() createUserSubscriptionDto: CreateUserSubscriptionDto,
  ) {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Cannot retreive user');
    createUserSubscriptionDto.userId = userId;
    const newUserSubscription = await this.userSubscriptionsService.create(
      createUserSubscriptionDto,
    );
    return this.apiResponseService.apiResponse(HttpStatus.CREATED, {
      userId: newUserSubscription.userId,
    });
  }

  @ApiBearerAuth('jwt')
  @Get()
  findAll(@Request() req) {
    const userId: number = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Cannot retreive user');

    return this.userSubscriptionsService.findAll(userId);
  }

  @ApiBearerAuth('jwt')
  @Get(':date') //expected date format => (utc, eg: 2024-09-24T21:35:25.701Z or "YYYY-MMM", eg: 2024-09)
  findSubscriptionsByMonth(@Request() req, @Param('date') date: string) {
    const userId: number = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Cannot retreive user');

    return this.userSubscriptionsService.findActiveSubscriptionByMonth(
      date,
      userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSubscriptionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    return this.userSubscriptionsService.update(+id, updateUserSubscriptionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.userSubscriptionsService.remove(+id);
    if (!result.affected) {
      return this.apiResponseService.apiResponse(HttpStatus.NOT_FOUND);
    }
    return this.apiResponseService.apiResponse(HttpStatus.NO_CONTENT);
  }
}
