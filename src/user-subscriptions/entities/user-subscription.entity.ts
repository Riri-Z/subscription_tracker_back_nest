import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillingCycle } from '../../users/enums/billingCycle';
import { StatusSubscription } from '../../users/enums/statusSubscription';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { User } from '../../users/entities/user.entity';
import { DecimalColumnTransformer } from 'src/transformer/DecimalColumnTransformer';

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

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  renewalDate: Date;

  @Column('decimal', {
    precision: 6,
    scale: 2,
    transformer: new DecimalColumnTransformer(),
    default: 0,
  })
  amount: number;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @Column({
    type: 'enum',
    enum: StatusSubscription,
    default: StatusSubscription.ACTIVE,
  })
  status: StatusSubscription;

  @ManyToOne(
    () => Subscription,
    (subscription) => subscription.userSubscriptions,
  )
  public subscription: Subscription;

  @ManyToOne(() => User, (user) => user.userSubscriptions)
  public user: User;
}
