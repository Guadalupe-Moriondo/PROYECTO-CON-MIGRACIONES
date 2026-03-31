import {IsInt,IsPositive,} from 'class-validator';

export class AddOrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}
