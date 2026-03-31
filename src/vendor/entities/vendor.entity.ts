import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  description: string;

  /** Comisión que la plataforma cobra al vendor (porcentaje). Gestionado por Admin. */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  commissionRate: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.vendorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.vendor)
  restaurants: Restaurant[];
}
