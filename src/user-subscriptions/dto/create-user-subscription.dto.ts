import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BillingCycle } from 'src/users/enums/billingCycle';
import { StatusSubscription } from 'src/users/enums/statusSubscription';

export class CreateUserSubscriptionDto {
  @ApiProperty()
  userId?: number;

  @ApiProperty()
  @IsNotEmpty()
  subscriptionName: string;

  subscriptionCategory?: string;

  icon_name?: string;

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  endDate: Date;

  renewalDate?: Date;

  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: BillingCycle, isArray: false })
  @IsNotEmpty()
  billingCycle: BillingCycle;

  @ApiProperty({ enum: StatusSubscription, isArray: false })
  status?: StatusSubscription;
}
