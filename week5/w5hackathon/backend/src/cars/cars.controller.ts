import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  create(@Body() dto: CreateCarDto, @Request() req, @UploadedFiles() files: Express.Multer.File[]) {
    return this.carsService.create(dto, req.user.userId, files);
  }

  @Get()
  findAll(
    @Query('make') make?: string,
    @Query('model') model?: string,
    @Query('year') year?: number,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('status') status?: string,
  ) {
    return this.carsService.findAll({ make, model, year, category, minPrice, maxPrice, status });
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findByUser(@Request() req) {
    return this.carsService.findByUser(req.user.userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.carsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/end')
  endAuction(@Param('id') id: string, @Request() req) {
    return this.carsService.endAuction(id, req.user.userId);
  }

  @Get('user/:id')
  findByUserId(@Param('id') id: string) {
    return this.carsService.findByUser(id);
  }
}
