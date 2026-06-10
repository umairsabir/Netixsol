import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Req() req: any,
    @Body('productId') productId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    const userId = req.user._id;
    return this.reviewsService.createReview(userId.toString(), productId, rating, comment);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  async addReply(
    @Req() req: any,
    @Param('id') reviewId: string,
    @Body('comment') comment: string,
  ) {
    const userId = req.user._id;
    const userName = req.user.name;
    return this.reviewsService.addReply(userId.toString(), userName, reviewId, comment);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Req() req: any, @Param('id') reviewId: string) {
    const userId = req.user._id;
    const userName = req.user.name;
    return this.reviewsService.toggleLike(userId.toString(), userName, reviewId);
  }

  @Get('product/:productId')
  async getReviewsByProduct(@Param('productId') productId: string) {
    return this.reviewsService.getReviewsByProduct(productId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Req() req: any, @Param('id') reviewId: string) {
    const userId = req.user._id;
    const role = req.user.role;
    return this.reviewsService.deleteReview(userId.toString(), role, reviewId);
  }
}
