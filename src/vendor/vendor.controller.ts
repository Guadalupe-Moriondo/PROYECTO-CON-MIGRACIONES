import {Controller,Get,Post,Patch,Delete,Body,Param,ParseIntPipe,UseGuards,} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto} from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateVendorDto) {
    return this.vendorService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.vendorService.findAll();
  }

  @Get('me')
  @Roles(UserRole.VENDOR)
  getMe(@CurrentUser() user: User) {
    return this.vendorService.findByUserId(user.id);
  }

  @Get('me/orders')
  @Roles(UserRole.VENDOR)
  getMyOrders(@CurrentUser() user: User) {
    return this.vendorService.getOrders(user.id);
  }

  @Get('me/report')
  @Roles(UserRole.VENDOR)
  getMyReport(@CurrentUser() user: User) {
    return this.vendorService.getSalesReport(user.id);
  }

  @Patch('me')
  @Roles(UserRole.VENDOR)
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateVendorDto) {
    return this.vendorService.updateProfile(user.id, dto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.findOne(id);
  }

  @Patch(':id/commission')
  @Roles(UserRole.ADMIN)
  updateCommission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommissionDto,
  ) {
    return this.vendorService.updateCommission(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.deactivate(id);
  }
}
