import {Injectable,NotFoundException,ForbiddenException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateReviewDto} from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { OrderStatus } from '../shared/enums/order-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreateReviewDto, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.user.id !== userId)
      throw new ForbiddenException('This order does not belong to you.');
    if (order.status !== OrderStatus.DELIVERED)
      throw new BadRequestException('You can only review delivered orders');

    const existing = await this.reviewRepo.findOne({
      where: {
        order: { id: dto.orderId },
        restaurant: { id: dto.restaurantId },
        user: { id: userId },
      },
    });
    if (existing)
      throw new BadRequestException('You already reviewed this order');

    const restaurant = await this.restaurantRepo.findOne({
      where: { id: dto.restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const review = this.reviewRepo.create({
      rating: dto.rating,
      comment: dto.comment,
      user: { id: userId } as any,
      restaurant,
      order: { id: dto.orderId } as any,
      product: dto.productId ? ({ id: dto.productId } as any) : null,
    });

    const saved = await this.reviewRepo.save(review);
    await this.updateRestaurantRating(dto.restaurantId);

    return saved;
  }

  async findByRestaurant(restaurantId: number) {
    return this.reviewRepo.find({
      where: { restaurant: { id: restaurantId }, isModerated: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.reviewRepo.find({
      relations: ['user', 'restaurant'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateReviewDto, userId: number) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'restaurant'],
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.user.id !== userId)
      throw new ForbiddenException('You cannot edit this review');

    Object.assign(review, dto);
    const saved = await this.reviewRepo.save(review);
    await this.updateRestaurantRating(review.restaurant.id);
    return saved;
  }

  async remove(id: number, userId: number) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'restaurant'],
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.user.id !== userId)
      throw new ForbiddenException('You cannot delete this review');

    const restaurantId = review.restaurant.id;
    await this.reviewRepo.remove(review);
    await this.updateRestaurantRating(restaurantId);
    return { message: 'Removed review' };
  }

  async moderate(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    review.isModerated = true;
    return this.reviewRepo.save(review);
  }

  async restore(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    review.isModerated = false;
    return this.reviewRepo.save(review);
  }

  

  private async updateRestaurantRating(restaurantId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('r.isModerated = false')
      .getRawOne();

    await this.restaurantRepo.update(restaurantId, {
      rating: parseFloat(result.avg) || 0,
      reviewCount: parseInt(result.count) || 0,
    });
  }
}
