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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user-subscriptions')
export class UserSubscriptionsController {
  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Post()
  create(@Body() createUserSubscriptionDto: CreateUserSubscriptionDto) {
    //check if userId is the same as in jwt
    return this.userSubscriptionsService.create(createUserSubscriptionDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Get()
  findAll(@Request() req) {
    const userId: number = req?.user?.sub;
    if (!userId) {
      throw new HttpException(
        "Impossible de récupérer l'utilisateur",
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.userSubscriptionsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Get(':date') //expected date format => (utc, eg: 2024-09-24T21:35:25.701Z or "YYYY-MMM", eg: 2024-09)
  findSubscriptionsByMonth(@Request() req, @Param('date') date: string) {
    const userId: number = req?.user?.sub;
    if (!userId) {
      throw new HttpException(
        "Impossible de récupérer l'utilisateur",
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.userSubscriptionsService.findByMonth(date, userId);
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
