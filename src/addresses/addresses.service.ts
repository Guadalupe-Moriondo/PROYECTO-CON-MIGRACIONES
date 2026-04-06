import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto} from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async create(userId: number, dto: CreateAddressDto) {
    // Si se marca como default, quitar el flag de las otras
    if (dto.isDefault) {
      await this.addressRepo.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    const address = this.addressRepo.create({
      ...dto,
      user: { id: userId } as any,
    });
    return this.addressRepo.save(address);
  }

  async findAll(userId: number) {
    return this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const address = await this.addressRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId)
      throw new ForbiddenException('You do not have access to this address');
    return address;
  }

  async update(id: number, userId: number, dto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);

    if (dto.isDefault) {
      await this.addressRepo.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async remove(id: number, userId: number) {
    const address = await this.findOne(id, userId);
    await this.addressRepo.remove(address);
    return { message: 'Address removed' };
  }
}
