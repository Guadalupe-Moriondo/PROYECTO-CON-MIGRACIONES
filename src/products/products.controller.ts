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
import { ProductsService } from './products.service';
import { CreateProductDto} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Controller('restaurants/:restaurantId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** GET /restaurants/:restaurantId/products — Público */
  @Get()
  findAll(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.productsService.findByRestaurant(restaurantId);
  }

  /** GET /restaurants/:restaurantId/products/:id — Público */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /** POST /restaurants/:restaurantId/products — Solo VENDOR */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  create(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.create(restaurantId, dto, user.id);
  }

  /** PATCH /restaurants/:restaurantId/products/:id — Solo VENDOR dueño */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(id, dto, user.id);
  }

  /** DELETE /restaurants/:restaurantId/products/:id — Solo VENDOR dueño */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.productsService.remove(id, user.id);
  }
}
