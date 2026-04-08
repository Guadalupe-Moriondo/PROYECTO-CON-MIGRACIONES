import {Injectable,NotFoundException,ForbiddenException,} from '@nestjs/common';
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
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('You do not have permission for this restaurant');
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
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, dto: UpdateProductDto, userId: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['restaurant', 'restaurant.vendor', 'restaurant.vendor.user'],
    });
    if (!product) throw new NotFoundException('Product not found');

    if (product.restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to modify this product');
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number, userId: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['restaurant', 'restaurant.vendor', 'restaurant.vendor.user'],
    });
    if (!product) throw new NotFoundException('Product not found');

    if (product.restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this product');
    }

    await this.productRepo.remove(product);
    return;
  }
}
