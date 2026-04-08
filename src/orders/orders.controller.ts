import {Controller,Get,Post,Patch,Delete,Body,Param,ParseIntPipe,UseGuards,} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {CreateOrderDto,} from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { UpdateItemQuantityDto } from './dto/update-item-quantity.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.ordersService.findAll({ id: user.id, role: user.role });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getStatusHistory(id);
  }

  @Post(':id/items')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddOrderItemDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.addItem(id, dto, user.id);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateItemQuantityDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateItemQuantity(id, itemId, dto, user.id);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.removeItem(id, itemId, user.id);
  }

  @Post(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.ordersService.confirm(id, user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.ordersService.cancel(id, { id: user.id, role: user.role });
  }

  @Patch(':id/vendor-status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENDOR)
  updateVendorStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateVendorStatus(id, dto, user.id);
  }
}
