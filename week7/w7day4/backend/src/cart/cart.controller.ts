import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':sessionId')
  getCart(@Param('sessionId') sessionId: string) {
    return this.cartService.getCart(sessionId);
  }

  @Post(':sessionId/items')
  addToCart(@Param('sessionId') sessionId: string, @Body() body: any) {
    return this.cartService.addToCart(sessionId, body);
  }

  @Patch(':sessionId/items/:productId')
  updateItemQuantity(
    @Param('sessionId') sessionId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItemQuantity(sessionId, productId, quantity);
  }

  @Delete(':sessionId/items/:productId')
  removeItem(
    @Param('sessionId') sessionId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(sessionId, productId);
  }
}
