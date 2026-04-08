import { IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateVendorDto {
 
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;
}