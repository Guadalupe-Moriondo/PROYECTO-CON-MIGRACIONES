import {Injectable,NotFoundException,ConflictException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateDriverDto} from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UserRole } from '../shared/enums/user-role.enum';
import { OrderStatus } from '../shared/enums/order-status.enum';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  
  async create(dto: CreateDriverDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.driverRepo.findOne({
      where: { user: { id: dto.userId } },
    });
    if (existing) throw new ConflictException('This user already has a driver profile');

    const driver = this.driverRepo.create({
      user,
      phone: dto.phone,
      vehicleType: dto.vehicleType,
      licensePlate: dto.licensePlate,
      documentNumber: dto.documentNumber,
    });

    const saved = await this.driverRepo.save(driver);
    user.role = UserRole.DRIVER;
    await this.userRepo.save(user);

    return saved;
  }

  findAll() {
    return this.driverRepo.find({ relations: ['user'] });
  }

  async findOne(id: number) {
    const driver = await this.driverRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async findByUserId(userId: number) {
    const driver = await this.driverRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!driver) throw new NotFoundException('Driver profile not found');
    return driver;
  }

  async updateProfile(userId: number, dto: UpdateDriverDto) {
    const driver = await this.findByUserId(userId);
    Object.assign(driver, dto);
    return this.driverRepo.save(driver);
  }

  async setAvailability(userId: number, dto: SetAvailabilityDto) {
    const driver = await this.findByUserId(userId);
    driver.isAvailable = dto.isAvailable;
    return this.driverRepo.save(driver);
  }

  async deactivate(id: number) {
    const driver = await this.findOne(id);
    driver.isActive = false;
    return this.driverRepo.save(driver);
  }


  async getAvailableOrders() {
    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.restaurant', 'restaurant')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.status = :status', { status: OrderStatus.READY })
      .andWhere('order.driver IS NULL')
      .orderBy('order.createdAt', 'ASC')
      .getMany();
  }

  async acceptOrder(userId: number, orderId: number) {
    const driver = await this.findByUserId(userId);

    if (!driver.isAvailable) {
      throw new BadRequestException('You must be available to accept orders');
    }

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['driver'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.driver) throw new BadRequestException('This order has already been assigned');
    if (order.status !== OrderStatus.READY) {
      throw new BadRequestException('The order is not ready for delivery');
    }

    order.driver = driver;
    order.status = OrderStatus.ON_THE_WAY;
    await this.orderRepo.save(order);

    return;
  }

  async completeOrder(userId: number, orderId: number) {
    const driver = await this.findByUserId(userId);

    const order = await this.orderRepo.findOne({
      where: { id: orderId, driver: { id: driver.id } },
    });
    if (!order) throw new NotFoundException('Order not found or not assigned to you');
    if (order.status !== OrderStatus.ON_THE_WAY) {
      throw new BadRequestException(`The order is in status ${order.status}`);
    }

    order.status = OrderStatus.DELIVERED;
    await this.orderRepo.save(order);

    return;
  }

  async getMyOrders(userId: number) {
    const driver = await this.findByUserId(userId);
    return this.orderRepo.find({
      where: { driver: { id: driver.id } },
      relations: ['user', 'restaurant', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEarnings(userId: number) {
    const driver = await this.findByUserId(userId);

    const orders = await this.orderRepo.find({
      where: { driver: { id: driver.id }, status: OrderStatus.DELIVERED },
    });

    const totalEarnings = orders.reduce(
      (sum, o) => sum + Number(o.total) * 0.1,
      0,
    );

    return {
      driverId: driver.id,
      deliveredOrders: orders.length,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
    };
  }
}
