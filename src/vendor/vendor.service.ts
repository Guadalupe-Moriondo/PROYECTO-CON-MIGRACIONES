import {Injectable,NotFoundException,ConflictException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateVendorDto} from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UserRole } from '../shared/enums/user-role.enum';
import { OrderStatus } from '../shared/enums/order-status.enum';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  
  async create(dto: CreateVendorDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.vendorRepo.findOne({
      where: { user: { id: dto.userId } },
    });
    if (existing) throw new ConflictException('This user already has a vendor profile.');

    const vendor = this.vendorRepo.create({
      user,
      businessName: dto.businessName,
      phone: dto.phone,
      description: dto.description,
    });

    const saved = await this.vendorRepo.save(vendor);
    user.role = UserRole.VENDOR;
    await this.userRepo.save(user);

    return saved;
  }

  findAll() {
    return this.vendorRepo.find({ relations: ['user', 'restaurants'] });
  }

  async findOne(id: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { id },
      relations: ['user', 'restaurants'],
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async findByUserId(userId: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'restaurants'],
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async updateProfile(userId: number, dto: UpdateVendorDto) {
    const vendor = await this.findByUserId(userId);
    Object.assign(vendor, dto);
    return this.vendorRepo.save(vendor);
  }

  
  async updateCommission(id: number, dto: UpdateCommissionDto) {
    const vendor = await this.findOne(id);
    vendor.commissionRate = dto.commissionRate;
    return this.vendorRepo.save(vendor);
  }

  async deactivate(id: number) {
    const vendor = await this.findOne(id);
    vendor.isActive = false;
    return this.vendorRepo.save(vendor);
  }


  async getOrders(userId: number) {
    const vendor = await this.findByUserId(userId);
    return this.orderRepo.find({
      where: { vendor: { id: vendor.id } },
      relations: ['user', 'restaurant', 'driver', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  
  async getSalesReport(userId: number) {
    const vendor = await this.findByUserId(userId);

    const orders = await this.orderRepo.find({
      where: {
        vendor: { id: vendor.id },
        status: OrderStatus.DELIVERED,
      },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const commission = (totalSales * Number(vendor.commissionRate)) / 100;

    return {
      vendorId: vendor.id,
      businessName: vendor.businessName,
      deliveredOrders: orders.length,
      totalSales,
      commissionRate: vendor.commissionRate,
      commissionOwed: commission,
      netRevenue: totalSales - commission,
    };
  }
}
