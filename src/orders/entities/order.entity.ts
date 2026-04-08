import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,OneToMany,CreateDateColumn,UpdateDateColumn,} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Vendor } from '../../vendor/entities/vendor.entity';
import { OrderStatus } from '../../shared/enums/order-status.enum';
import { OrderItem } from './order-item.entity';
import { Address } from '../../addresses/entities/address.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CART,
  })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

 
  @Column({ nullable: true })
  deliveryStreet: string;

  @Column({ nullable: true })
  deliveryCity: string;

  @Column({ nullable: true })
  deliveryState: string;

  @Column({ nullable: true })
  deliveryZipCode: string;

  @Column({ nullable: true })
  discountCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

 

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, { nullable: true })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  
  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  
  @ManyToOne(() => Driver, (driver) => driver.orders, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Address, { nullable: true, eager: false })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (h) => h.order, { cascade: true })
  statusHistory: OrderStatusHistory[];

  @OneToMany(() => Review, (review) => review.order)
  reviews: Review[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}
