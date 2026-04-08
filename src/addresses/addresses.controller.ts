import {Controller,Get,Post,Patch,Delete,Body,Param,ParseIntPipe,UseGuards,} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.addressesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.remove(id, user.id);
  }
}
