import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BillingCycle } from 'src/users/enums/billingCycle';
import { StatusSubscription } from 'src/users/enums/statusSubscription';

export class CreateUserSubscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;

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

  @IsNotEmpty()
  renewalDate: Date;

  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  billingCycle: BillingCycle;

  @ApiProperty()
  @IsNotEmpty()
  status: StatusSubscription;
}
