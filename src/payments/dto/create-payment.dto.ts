import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../../shared/enums/payment.enum';

export class CreatePaymentDto {
  @IsInt()
  orderId: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  externalRef?: string;
}
