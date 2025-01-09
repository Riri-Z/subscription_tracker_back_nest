import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserSubscriptionDto } from './create-user-subscription.dto';

export class UpdateUserSubscriptionDto extends PartialType(
  CreateUserSubscriptionDto,
) {
  @ApiProperty()
  subscription: {
    id: number;
    name: string;
    icon_name?: string;
    category: string;
  };
}
