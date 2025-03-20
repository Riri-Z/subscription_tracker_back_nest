import { Module } from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscriptions } from './entities/user-subscription.entity';
import { SharedModule } from 'src/shared/shared.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSubscriptions]),
    SharedModule,
    SubscriptionsModule,
    CacheModule,
  ],
  controllers: [UserSubscriptionsController],
  providers: [UserSubscriptionsService],
})
export class UserSubscriptionsModule {}
