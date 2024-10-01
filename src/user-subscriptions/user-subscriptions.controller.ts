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

@Controller('user-subscriptions')
export class UserSubscriptionsController {
  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserSubscriptionDto: CreateUserSubscriptionDto) {
    //check if userId is the same as in jwt
    return this.userSubscriptionsService.create(createUserSubscriptionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    const userId = req?.user?.userId;
    if (!userId) {
      throw new HttpException(
        "Impossible de récupérer l'utilisateur",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return this.userSubscriptionsService.findAll(userId);
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
