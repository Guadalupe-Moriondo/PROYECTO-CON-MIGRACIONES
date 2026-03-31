import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../shared/enums/user-role.enum';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  findAll() {
    return this.userRepo.find({ select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'] });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateMe(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async updateRole(id: number, role: UserRole, requestingUser: { id: number; role: UserRole }) {
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo el admin puede cambiar roles');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.role = role;
    return this.userRepo.save(user);
  }

  async deactivate(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.isActive = false;
    return this.userRepo.save(user);
  }

  // ── Favoritos ──────────────────────────────────────────────────────────────

  async getFavorites(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favoriteRestaurants'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user.favoriteRestaurants;
  }

  async addFavorite(userId: number, restaurantId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favoriteRestaurants'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    const already = user.favoriteRestaurants.some((r) => r.id === restaurantId);
    if (already) throw new BadRequestException('Ya está en favoritos');

    user.favoriteRestaurants.push(restaurant);
    await this.userRepo.save(user);
    return { message: 'Agregado a favoritos' };
  }

  async removeFavorite(userId: number, restaurantId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favoriteRestaurants'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.favoriteRestaurants = user.favoriteRestaurants.filter(
      (r) => r.id !== restaurantId,
    );
    await this.userRepo.save(user);
    return { message: 'Eliminado de favoritos' };
  }

  // ── Historial de pedidos ───────────────────────────────────────────────────

  async getOrderHistory(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['orders', 'orders.restaurant', 'orders.items', 'orders.items.product'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user.orders;
  }
}
