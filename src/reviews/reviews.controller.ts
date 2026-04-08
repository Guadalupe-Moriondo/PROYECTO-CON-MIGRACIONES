import {Controller,Get,Post,Patch,Delete,Body,Param,ParseIntPipe,UseGuards,} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.reviewsService.findByRestaurant(restaurantId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.reviewsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user.id);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  moderate(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.moderate(id);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.restore(id);
  }
}
