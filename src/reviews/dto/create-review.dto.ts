import {IsInt,IsOptional,IsString,Max,Min,} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  /** ID del restaurante a reseñar */
  @IsInt()
  restaurantId: number;

  /** ID del pedido (para verificar que el user haya comprado) */
  @IsInt()
  orderId: number;

  /** Opcional: reseñar también un producto específico */
  @IsOptional()
  @IsInt()
  productId?: number;
}