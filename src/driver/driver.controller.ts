import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  /** POST /drivers — Admin da de alta a un driver */
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateDriverDto) {
    return this.driverService.create(dto);
  }

  /** GET /drivers — Solo Admin */
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.driverService.findAll();
  }

  /** GET /drivers/available-orders — Pedidos disponibles para tomar */
  @Get('available-orders')
  @Roles(UserRole.DRIVER)
  getAvailableOrders() {
    return this.driverService.getAvailableOrders();
  }

  /** GET /drivers/me */
  @Get('me')
  @Roles(UserRole.DRIVER)
  getMe(@CurrentUser() user: User) {
    return this.driverService.findByUserId(user.id);
  }

  /** GET /drivers/me/orders — Historial de entregas */
  @Get('me/orders')
  @Roles(UserRole.DRIVER)
  getMyOrders(@CurrentUser() user: User) {
    return this.driverService.getMyOrders(user.id);
  }

  /** GET /drivers/me/earnings — Resumen de ganancias */
  @Get('me/earnings')
  @Roles(UserRole.DRIVER)
  getEarnings(@CurrentUser() user: User) {
    return this.driverService.getEarnings(user.id);
  }

  /** PATCH /drivers/me — Actualiza perfil propio */
  @Patch('me')
  @Roles(UserRole.DRIVER)
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateDriverDto) {
    return this.driverService.updateProfile(user.id, dto);
  }

  /** PATCH /drivers/me/availability — Activa o desactiva disponibilidad */
  @Patch('me/availability')
  @Roles(UserRole.DRIVER)
  setAvailability(@CurrentUser() user: User, @Body() dto: SetAvailabilityDto) {
    return this.driverService.setAvailability(user.id, dto);
  }

  /** POST /drivers/me/orders/:orderId/accept — Acepta un pedido */
  @Post('me/orders/:orderId/accept')
  @Roles(UserRole.DRIVER)
  acceptOrder(
    @CurrentUser() user: User,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.driverService.acceptOrder(user.id, orderId);
  }

  /** POST /drivers/me/orders/:orderId/complete — Marca como entregado */
  @Post('me/orders/:orderId/complete')
  @Roles(UserRole.DRIVER)
  completeOrder(
    @CurrentUser() user: User,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.driverService.completeOrder(user.id, orderId);
  }

  /** GET /drivers/:id — Admin */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driverService.findOne(id);
  }

  /** DELETE /drivers/:id — Admin desactiva driver */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.driverService.deactivate(id);
  }
}
