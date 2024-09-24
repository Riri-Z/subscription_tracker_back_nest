import { UserSubscriptions } from 'src/user-subscriptions/entities/user-subscription.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'subscription',
})
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  icon_name: string;

  @Column()
  category: string;

  @OneToMany(
    () => UserSubscriptions,
    (userSubscriptions) => userSubscriptions.user,
  )
  public userSubscriptions: UserSubscriptions[];
}
