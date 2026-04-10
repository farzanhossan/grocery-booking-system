import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { CartService } from '../../services/cart.service';
import { AddToCartDto } from '../../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../../dto/update-cart-item.dto';

@ApiTags('Web - Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('cart')
export class WebCartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ResponseMessage('Cart retrieved successfully')
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ResponseMessage('Item added to cart successfully')
  addToCart(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ResponseMessage('Cart item updated successfully')
  updateCartItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ResponseMessage('Item removed from cart successfully')
  removeCartItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cartService.removeCartItem(req.user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ResponseMessage('Cart cleared successfully')
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout - place order from cart items' })
  @ResponseMessage('Order placed successfully')
  checkout(@Request() req) {
    return this.cartService.checkout(req.user.id);
  }
}
