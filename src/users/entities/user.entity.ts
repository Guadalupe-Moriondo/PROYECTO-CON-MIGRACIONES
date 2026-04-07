import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../../shared/enums/user-role.enum';
import { Order } from '../../orders/entities/order.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Vendor } from '../../vendor/entities/vendor.entity';
import { Driver } from '../../driver/entities/driver.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Address, (address) => address.user, {
  cascade: true,
  })
  addresses: Address[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @ManyToMany(() => Restaurant)
  @JoinTable({ name: 'user_favorite_restaurants' })
  favoriteRestaurants: Restaurant[];

  // Un usuario con rol VENDOR tiene un perfil Vendor
  @OneToOne(() => Vendor, (vendor) => vendor.user)
  vendorProfile: Vendor;

  // Un usuario con rol DRIVER tiene un perfil Driver
  @OneToOne(() => Driver, (driver) => driver.user)
  driverProfile: Driver;
}
