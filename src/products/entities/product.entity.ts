import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,OneToMany,JoinColumn,CreateDateColumn,UpdateDateColumn,} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Review } from '../../reviews/entities/review.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}
