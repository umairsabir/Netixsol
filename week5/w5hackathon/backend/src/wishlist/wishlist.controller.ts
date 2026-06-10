import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':carId')
  toggleWishlist(@Param('carId') carId: string, @Request() req) {
    return this.wishlistService.toggleWishlist(req.user.userId, carId);
  }

  @Get()
  getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.userId);
  }
}
