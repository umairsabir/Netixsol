import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  placeBid(@Body() dto: CreateBidDto, @Request() req) {
    // Socket.IO emitting happens on frontend or we can emit here, 
    // but the plan says notifications module handles socket.
    return this.bidsService.placeBid(dto, req.user.userId);
  }

  @Get('car/:carId')
  findByCar(@Param('carId') carId: string) {
    return this.bidsService.findByCar(carId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/mine')
  findByUser(@Request() req) {
    return this.bidsService.findByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.bidsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.bidsService.markAsPaid(id);
  }
}
