import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';
import { Address } from '../addresses/entities/address.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Driver } from '../driver/entities/driver.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import {CreateOrderDto,} from './dto/create-order.dto';
import { AddOrderItemDto} from './dto/add-order-item.dto';
import { UpdateItemQuantityDto } from './dto/update-item-quantity.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { OrderStatus } from '../shared/enums/order-status.enum';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,

    @InjectRepository(OrderStatusHistory)
    private readonly historyRepo: Repository<OrderStatusHistory>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,

    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  // ── Crear orden (carrito) ──────────────────────────────────────────────────

  async create(dto: CreateOrderDto, userId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: dto.restaurantId, isActive: true },
      relations: ['vendor'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const address = await this.addressRepo.findOne({
      where: { id: dto.addressId },
      relations: ['user'],
    });
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId)
      throw new ForbiddenException('That address doesnt belong to you');

    const order = this.orderRepo.create({
      status: OrderStatus.CART,
      total: 0,
      user: { id: userId } as User,
      restaurant,
      vendor: restaurant.vendor,
      address,
      deliveryStreet: address.street,
      deliveryCity: address.city,
      deliveryState: address.state,
      deliveryZipCode: address.zipCode,
    });

    const saved = await this.orderRepo.save(order);
    await this.recordHistory(saved, OrderStatus.CART, userId, UserRole.USER);
    return saved;
  }

  // ── Items del carrito ──────────────────────────────────────────────────────

  async addItem(orderId: number, dto: AddOrderItemDto, userId: number) {
    const order = await this.getOrderOrFail(orderId);
    this.assertOwner(order, userId);
    this.assertStatus(order, OrderStatus.CART, 'add items');

    const product = await this.productRepo.findOne({
      where: { id: dto.productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Si ya existe el item, incrementa cantidad
    const existing = await this.itemRepo.findOne({
      where: { order: { id: orderId }, product: { id: product.id } },
    });

    if (existing) {
      existing.quantity += dto.quantity;
      await this.itemRepo.save(existing);
    } else {
      const item = this.itemRepo.create({
        order: { id: orderId } as Order,
        product,
        quantity: dto.quantity,
        price: product.price,
      });
      await this.itemRepo.save(item);
    }

    await this.recalcTotal(orderId);
    return this.findOne(orderId);
  }

  async updateItemQuantity(
    orderId: number,
    itemId: number,
    dto: UpdateItemQuantityDto,
    userId: number,
  ) {
    const order = await this.getOrderOrFail(orderId);
    this.assertOwner(order, userId);
    this.assertStatus(order, OrderStatus.CART, 'modify items');

    const item = await this.itemRepo.findOne({
      where: { id: itemId, order: { id: orderId } },
    });
    if (!item) throw new NotFoundException('Item not found');

    item.quantity = dto.quantity;
    await this.itemRepo.save(item);
    await this.recalcTotal(orderId);
    return this.findOne(orderId);
  }

  async removeItem(orderId: number, itemId: number, userId: number) {
    const order = await this.getOrderOrFail(orderId);
    this.assertOwner(order, userId);
    this.assertStatus(order, OrderStatus.CART, 'remove items');

    const item = await this.itemRepo.findOne({
      where: { id: itemId, order: { id: orderId } },
    });
    if (!item) throw new NotFoundException('Item not found');

    await this.itemRepo.remove(item);
    await this.recalcTotal(orderId);
    return { message: 'Item eliminado' };
  }

  // ── Confirmar y pagar ──────────────────────────────────────────────────────

  async confirm(orderId: number, userId: number) {
    const order = await this.getOrderOrFail(orderId);
    this.assertOwner(order, userId);
    this.assertStatus(order, OrderStatus.CART, 'confirm');

    if (!order.items || order.items.length === 0)
      throw new BadRequestException('The cart is empty');

    order.status = OrderStatus.CONFIRMED;
    const saved = await this.orderRepo.save(order);
    await this.recordHistory(saved, OrderStatus.CONFIRMED, userId, UserRole.USER);
    return saved;
  }

  // ── Flujo VENDOR ───────────────────────────────────────────────────────────

  async updateVendorStatus(
    orderId: number,
    dto: UpdateOrderStatusDto,
    userId: number,
  ) {
    const order = await this.getOrderOrFail(orderId);

    const vendor = await this.vendorRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!vendor || order.vendor?.id !== vendor.id)
      throw new ForbiddenException('This order is not from your business.');

    const allowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PAID]:     [OrderStatus.ACCEPTED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
    };

    if (!allowed[order.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `You cannot change from ${order.status} to ${dto.status}`,
      );
    }

    order.status = dto.status;
    const saved = await this.orderRepo.save(order);
    await this.recordHistory(saved, dto.status, userId, UserRole.VENDOR);
    return saved;
  }

  // ── Flujo ADMIN ────────────────────────────────────────────────────────────

  async assignDriver(orderId: number, dto: AssignDriverDto) {
    const order = await this.getOrderOrFail(orderId);

    if (order.status !== OrderStatus.READY)
      throw new BadRequestException('The order must be READY to assign a driver');
    if (order.driver)
      throw new BadRequestException('The order already has an assigned driver.');

    const driver = await this.driverRepo.findOne({
      where: { id: dto.driverId, isAvailable: true, isActive: true },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    order.driver = driver;
    order.status = OrderStatus.ON_THE_WAY;
    const saved = await this.orderRepo.save(order);
    await this.recordHistory(saved, OrderStatus.ON_THE_WAY, driver.id, UserRole.DRIVER);
    return saved;
  }

  

  

  // ── Cancelar ───────────────────────────────────────────────────────────────

  async cancel(orderId: number, user: { id: number; role: UserRole }) {
    const order = await this.getOrderOrFail(orderId);

    if (user.role === UserRole.DRIVER)
      throw new ForbiddenException('The driver cannot cancel orders');

    if (user.role === UserRole.USER) {
      this.assertOwner(order, user.id);
      const cancellable = [OrderStatus.CART, OrderStatus.CONFIRMED];
      if (!cancellable.includes(order.status))
        throw new BadRequestException('You cannot cancel the order in this state');
    }

    if (user.role === UserRole.VENDOR) {
      const vendor = await this.vendorRepo.findOne({
        where: { user: { id: user.id } },
      });
      if (!vendor || order.vendor?.id !== vendor.id)
        throw new ForbiddenException('This order is not from your business.');
      const cancellable = [OrderStatus.CONFIRMED, OrderStatus.ACCEPTED];
      if (!cancellable.includes(order.status))
        throw new BadRequestException('You cannot cancel the order in this state');
    }

    order.status = OrderStatus.CANCELLED;
    const saved = await this.orderRepo.save(order);
    await this.recordHistory(saved, OrderStatus.CANCELLED, user.id, user.role);
    return saved;
  }

  // ── Consultas ──────────────────────────────────────────────────────────────

  async findAll(user: { id: number; role: UserRole }) {
    if (user.role === UserRole.ADMIN) {
      return this.orderRepo.find({
        relations: ['user', 'restaurant', 'vendor', 'driver', 'items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.USER) {
      return this.orderRepo.find({
        where: { user: { id: user.id } },
        relations: ['restaurant', 'driver', 'items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.VENDOR) {
      const vendor = await this.vendorRepo.findOne({
        where: { user: { id: user.id } },
      });
      if (!vendor) return [];
      return this.orderRepo.find({
        where: { vendor: { id: vendor.id } },
        relations: ['user', 'restaurant', 'driver', 'items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.DRIVER) {
      const driver = await this.driverRepo.findOne({
        where: { user: { id: user.id } },
      });
      if (!driver) return [];
      return this.orderRepo.find({
        where: { driver: { id: driver.id } },
        relations: ['restaurant', 'vendor', 'items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
    }

    return [];
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'user',
        'restaurant',
        'vendor',
        'driver',
        'driver.user',
        'address',
        'items',
        'items.product',
        'payments',
      ],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getStatusHistory(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['statusHistory', 'statusHistory.changedBy'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order.statusHistory;
  }

  // ── Helpers privados ───────────────────────────────────────────────────────

  private async getOrderOrFail(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'vendor', 'driver', 'items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private assertOwner(order: Order, userId: number) {
    if (order.user?.id !== userId)
      throw new ForbiddenException('This order does not belong to you.');
  }

  private assertStatus(order: Order, expected: OrderStatus, action: string) {
    if (order.status !== expected)
      throw new BadRequestException(
        `You can only use ${action} when the order is in the ${expected} state. Current state: ${order.status}`,
      );
  }

  private async recalcTotal(orderId: number) {
    const items = await this.itemRepo.find({
      where: { order: { id: orderId } },
    });
    const total = items.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0,
    );
    await this.orderRepo.update(orderId, { total });
  }

  private async recordHistory(
    order: Order,
    status: OrderStatus,
    userId: number,
    role: UserRole,
  ) {
    const entry = this.historyRepo.create({
      order,
      status,
      changedByRole: role,
      changedBy: { id: userId } as User,
    });
    await this.historyRepo.save(entry);
  }
}
