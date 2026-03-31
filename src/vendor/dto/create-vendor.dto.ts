import { IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateVendorDto {
  /** ID del usuario que se convertirá en vendor */
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