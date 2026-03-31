import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { Restaurant } from './entities/restaurant.entity';
import { Vendor } from '../vendor/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Vendor])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService, TypeOrmModule],
})
export class RestaurantsModule {}
