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
} from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('user-subscriptions')
export class UserSubscriptionsController {
  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) {}

  @ApiBearerAuth('jwt')
  @Post()
  create(
    @Req() req,
    @Body() createUserSubscriptionDto: CreateUserSubscriptionDto,
  ) {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Cannot retreive user');
    createUserSubscriptionDto.userId = userId;
    return this.userSubscriptionsService.create(createUserSubscriptionDto);
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
    @Param('id') id: string,
    @Body() updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    return this.userSubscriptionsService.update(+id, updateUserSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSubscriptionsService.remove(+id);
  }
}
