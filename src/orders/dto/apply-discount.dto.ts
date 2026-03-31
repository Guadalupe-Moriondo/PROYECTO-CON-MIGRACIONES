import {IsString} from 'class-validator';

export class ApplyDiscountDto {
  @IsString()
  code: string;
}