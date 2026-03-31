import {Controller,Get,Post,Patch,Delete,Body,Param,Query,ParseIntPipe,UseGuards,} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  /** GET /restaurants?search=pizza&category=italiana — Público */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.restaurantsService.findAll({ search, category });
  }

  /** GET /restaurants/:id — Público */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.findOne(id);
  }

  /** POST /restaurants — Solo VENDOR */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  create(@Body() dto: CreateRestaurantDto, @CurrentUser() user: User) {
    return this.restaurantsService.create(dto, user.id);
  }

  /** PATCH /restaurants/:id — Solo el VENDOR dueño */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.update(id, dto, user.id);
  }

  /** DELETE /restaurants/:id — El VENDOR dueño */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.restaurantsService.remove(id, user.id);
  }

  /** DELETE /restaurants/:id/admin — Admin desactiva */
  @Delete(':id/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminRemove(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.adminRemove(id);
  }
}
