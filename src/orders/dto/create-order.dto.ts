import {IsInt} from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  restaurantId: number;

  @IsInt()
  addressId: number;
}

