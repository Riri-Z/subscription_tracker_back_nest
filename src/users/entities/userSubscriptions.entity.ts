import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BillingCycle } from '../enums/billingCycle';
import { StatusSubscription } from '../enums/statusSubscription';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { User } from './user.entity';

@Entity({
  name: 'user_subscription',
})
export class UserSubscriptions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  subscriptionId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  renewalDate: Date;

  @Column()
  amount: number;

  @Column()
  billingCycle: BillingCycle;

  @Column()
  status: StatusSubscription;

  @ManyToOne(
    () => Subscription,
    (subscription) => subscription.userSubscriptions,
  )
  public subscription: Subscription;

  @ManyToOne(() => User, (user) => user.userSubscriptions)
  public user: User;
}
