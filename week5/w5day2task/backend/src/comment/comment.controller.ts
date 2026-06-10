import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async getComments() {
    return this.commentService.getAllComments();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(@Request() req: any, @Body('content') content: string) {
    return this.commentService.createComment(req.user._id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reply')
  async createReply(@Request() req: any, @Param('id') id: string, @Body('content') content: string) {
    return this.commentService.createReply(req.user._id, id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Request() req: any, @Param('id') id: string) {
    return this.commentService.toggleLike(req.user._id, id);
  }
}
