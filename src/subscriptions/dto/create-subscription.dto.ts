import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty()
  id?: number;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: false })
  icon_url?: string;
}
