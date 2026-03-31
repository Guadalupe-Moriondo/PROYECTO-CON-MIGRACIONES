import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async create(restaurantId: number, dto: CreateProductDto, userId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
      relations: ['vendor', 'vendor.user'],
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    if (restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('No tenés permiso sobre este restaurante');
    }

    const product = this.productRepo.create({ ...dto, restaurant });
    return this.productRepo.save(product);
  }

  async findByRestaurant(restaurantId: number) {
    return this.productRepo.find({
      where: { restaurant: { id: restaurantId }, isActive: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: number, dto: UpdateProductDto, userId: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['restaurant', 'restaurant.vendor', 'restaurant.vendor.user'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('No tenés permiso para modificar este producto');
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number, userId: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['restaurant', 'restaurant.vendor', 'restaurant.vendor.user'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('No tenés permiso para eliminar este producto');
    }

    await this.productRepo.remove(product);
    return { message: 'Producto eliminado' };
  }
}
