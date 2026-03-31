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
import { Order } from '../../orders/entities/order.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  vehicleType: string;

  @Column({ nullable: true })
  licensePlate: string;

  @Column({ nullable: true })
  documentNumber: string;

  /** El driver puede activar/desactivar su disponibilidad */
  @Column({ default: false })
  isAvailable: boolean;

  @Column({ default: true })
  isActive: boolean;

  /** Calificación promedio del driver */
  @Column({ type: 'float', default: 0 })
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.driverProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Order, (order) => order.driver)
  orders: Order[];
}
