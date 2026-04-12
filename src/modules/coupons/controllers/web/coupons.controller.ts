import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { CouponsService } from '../../services/coupons.service';
import { ValidateCouponDto } from '../../dto/validate-coupon.dto';

@ApiTags('Web - Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('coupons')
export class WebCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Validate a coupon code',
    description: 'Validates the coupon and returns the potential discount. Pass a subtotal of 0 to just check validity.',
  })
  @ResponseMessage('Coupon validated successfully')
  validate(@Request() req, @Body() dto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(dto.code, req.user.id, 0);
  }
}
