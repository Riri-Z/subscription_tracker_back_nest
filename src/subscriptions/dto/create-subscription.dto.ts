import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: false })
  icon_name?: string;

  @ApiProperty({ required: false })
  category?: string;
}
