import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from './entities/user-address.entity';
import { AddressesService } from './services/addresses.service';
import { WebAddressesController } from './controllers/web/addresses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress])],
  controllers: [WebAddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
