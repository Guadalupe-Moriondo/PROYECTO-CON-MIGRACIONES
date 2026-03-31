import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
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

  /**
   * Procesa el pago de un pedido.
   * El pedido debe estar en estado CONFIRMED.
   * Tras el pago exitoso pasa a PAID y queda listo para que el vendor lo acepte.
   */
  async pay(dto: CreatePaymentDto, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['user', 'payments'],
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');

    if (order.user.id !== userId)
      throw new ForbiddenException('Este pedido no te pertenece');

    if (order.status !== OrderStatus.CONFIRMED)
      throw new BadRequestException(
        `El pedido debe estar CONFIRMADO para pagar. Estado actual: ${order.status}`,
      );

    const existingCompleted = order.payments?.find(
      (p) => p.status === PaymentStatus.COMPLETED,
    );
    if (existingCompleted)
      throw new BadRequestException('Este pedido ya fue pagado');

    // Registrar el pago
    const payment = this.paymentRepo.create({
      order,
      amount: order.total,
      method: dto.method,
      status: PaymentStatus.COMPLETED,
      externalRef: dto.externalRef,
    });
    await this.paymentRepo.save(payment);

    // Avanzar estado de la orden
    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    return {
      message: 'Pago procesado correctamente',
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
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  /** Solo ADMIN */
  async findAll() {
    return this.paymentRepo.find({
      relations: ['order', 'order.user'],
      order: { createdAt: 'DESC' },
    });
  }
}
