import { IsNotEmpty } from 'class-validator';
import { BillingCycle } from 'src/users/enums/billingCycle';
import { StatusSubscription } from 'src/users/enums/statusSubscription';

export class CreateUserSubscriptionDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  subscriptionName: string;

  subscriptionCategory?: string;

  icon_name?: string;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty()
  renewalDate: Date;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  billingCycle: BillingCycle;

  @IsNotEmpty()
  status: StatusSubscription;
}
