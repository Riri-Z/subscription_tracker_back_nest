import { CreateSubscriptionDto } from './create-subscription.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}
