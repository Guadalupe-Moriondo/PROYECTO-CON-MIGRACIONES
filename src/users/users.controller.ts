import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from './entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users  — Solo ADMIN */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /** GET /users/me — Usuario autenticado ve su propio perfil */
  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  /** GET /users/me/orders — Historial de pedidos del usuario */
  @Get('me/orders')
  getMyOrders(@CurrentUser() user: User) {
    return this.usersService.getOrderHistory(user.id);
  }

  /** GET /users/me/favorites — Restaurantes favoritos */
  @Get('me/favorites')
  getFavorites(@CurrentUser() user: User) {
    return this.usersService.getFavorites(user.id);
  }

  /** POST /users/me/favorites/:restaurantId */
  @Patch('me/favorites/:restaurantId')
  addFavorite(
    @CurrentUser() user: User,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.usersService.addFavorite(user.id, restaurantId);
  }

  /** DELETE /users/me/favorites/:restaurantId */
  @Delete('me/favorites/:restaurantId')
  removeFavorite(
    @CurrentUser() user: User,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.usersService.removeFavorite(user.id, restaurantId);
  }

  /** PATCH /users/me — Actualiza datos propios */
  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  /** GET /users/:id — Solo ADMIN */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /** PATCH /users/:id/role — Solo ADMIN */
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: UserRole,
    @CurrentUser() requestingUser: User,
  ) {
    return this.usersService.updateRole(id, role, requestingUser);
  }

  /** DELETE /users/:id — Solo ADMIN (desactiva, no borra) */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivate(id);
  }
}
