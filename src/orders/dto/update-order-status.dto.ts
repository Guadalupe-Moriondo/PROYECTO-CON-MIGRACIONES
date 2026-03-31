import {IsEnum,} from 'class-validator';
import { OrderStatus } from '../../shared/enums/order-status.enum';


export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
