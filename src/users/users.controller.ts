import {Controller,Get,Patch,Delete,Param,Body,ParseIntPipe,UseGuards,} from '@nestjs/common';
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

  
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Get('me/orders')
  getMyOrders(@CurrentUser() user: User) {
    return this.usersService.getOrderHistory(user.id);
  }

  @Get('me/favorites')
  getFavorites(@CurrentUser() user: User) {
    return this.usersService.getFavorites(user.id);
  }

  @Patch('me/favorites/:restaurantId')
  addFavorite(
    @CurrentUser() user: User,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.usersService.addFavorite(user.id, restaurantId);
  }

  @Delete('me/favorites/:restaurantId')
  removeFavorite(
    @CurrentUser() user: User,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.usersService.removeFavorite(user.id, restaurantId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    console.log('Controller dto:', dto);
    return this.usersService.updateMe(user.id, dto);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

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

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  activate(@Param('id') id: number) {
    return this.usersService.setActiveStatus(id, true);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: number) {
    return this.usersService.setActiveStatus(id, false);
  }
}
