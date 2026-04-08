import {Entity,PrimaryGeneratedColumn,Column,OneToMany,ManyToOne,JoinColumn,CreateDateColumn,UpdateDateColumn,} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Vendor } from '../../vendor/entities/vendor.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  openTime: string;

  @Column({ nullable: true })
  closeTime: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Vendor, (vendor) => vendor.restaurants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  @OneToMany(() => Product, (product) => product.restaurant)
  products: Product[];

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews: Review[];
}
