import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;
}