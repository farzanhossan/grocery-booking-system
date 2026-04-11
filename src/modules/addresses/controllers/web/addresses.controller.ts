import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { AddressesService } from '../../services/addresses.service';
import { UpdateAddressDto } from '../../dto/update-address.dto';

@ApiTags('Web - Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('addresses')
export class WebAddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved addresses' })
  @ResponseMessage('Addresses retrieved successfully')
  findAll(@Request() req) {
    return this.addressesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved address' })
  @ResponseMessage('Address retrieved successfully')
  findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.addressesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a saved address' })
  @ResponseMessage('Address updated successfully')
  update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved address' })
  @ResponseMessage('Address deleted successfully')
  remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.addressesService.remove(req.user.id, id);
  }
}
