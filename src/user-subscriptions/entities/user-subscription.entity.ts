import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BillingCycle } from '../../users/enums/billingCycle';
import { StatusSubscription } from '../../users/enums/statusSubscription';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { User } from '../../users/entities/user.entity';

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
