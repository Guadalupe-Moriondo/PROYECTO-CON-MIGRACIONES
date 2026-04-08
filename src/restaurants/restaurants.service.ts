import {Injectable,NotFoundException,ForbiddenException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import { CreateRestaurantDto} from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  async create(dto: CreateRestaurantDto, userId: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { user: { id: userId }, isActive: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const restaurant = this.restaurantRepo.create({ ...dto, vendor });
    return this.restaurantRepo.save(restaurant);
  }

  async findAll(filters: { search?: string; category?: string }) {
    const query = this.restaurantRepo
      .createQueryBuilder('r')
      .where('r.isActive = true');

    if (filters.search) {
      query.andWhere('LOWER(r.name) LIKE LOWER(:search)', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.category) {
      query.andWhere('LOWER(r.category) = LOWER(:category)', {
        category: filters.category,
      });
    }

    return query.orderBy('r.rating', 'DESC').getMany();
  }

  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['products', 'vendor', 'vendor.user'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async update(id: number, dto: UpdateRestaurantDto, userId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['vendor', 'vendor.user'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to modify this restaurant');
    }

    Object.assign(restaurant, dto);
    return this.restaurantRepo.save(restaurant);
  }

  async remove(id: number, userId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['vendor', 'vendor.user'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.vendor.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this restaurant');
    }

    await this.restaurantRepo.remove(restaurant);
    return { message: 'Removed restaurant' };
  }

  
  async adminRemove(id: number) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    restaurant.isActive = false;
    return this.restaurantRepo.save(restaurant);
  }
}
