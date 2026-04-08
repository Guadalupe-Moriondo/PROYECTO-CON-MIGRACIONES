import {Injectable,NotFoundException,BadRequestException,ForbiddenException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '../shared/enums/payment.enum';
import { OrderStatus } from '../shared/enums/order-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  
  async pay(dto: CreatePaymentDto, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['user', 'payments'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.user.id !== userId)
      throw new ForbiddenException('This order does not belong to you.');

    if (order.status !== OrderStatus.CONFIRMED)
      throw new BadRequestException(
        `The order must be CONFIRMED before payment can be made. Current status: ${order.status}`,
      );

    const existingCompleted = order.payments?.find((p) => p.status === PaymentStatus.COMPLETED,);
    if (existingCompleted)
      throw new BadRequestException('This order has already been paid for.');


    const payment = this.paymentRepo.create({
      order,
      amount: order.total,
      method: dto.method,
      status: PaymentStatus.COMPLETED,
      externalRef: dto.externalRef,
    });
    await this.paymentRepo.save(payment);

    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    return {
      payment: {
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
      },
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
      },
    };
  }

  async findByOrder(orderId: number) {
    return this.paymentRepo.find({
      where: { order: { id: orderId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  
  async findAll() {
    return this.paymentRepo.find({
      relations: ['order', 'order.user'],
      order: { createdAt: 'DESC' },
    });
  }
}
