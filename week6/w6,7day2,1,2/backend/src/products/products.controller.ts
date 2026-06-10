import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, UseInterceptors, UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @UseInterceptors(FilesInterceptor('productImages', 10))
  async create(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const data = { ...body };

    // Initial parsing of arrays and maps
    if (typeof data.colors === 'string') {
      try { data.colors = JSON.parse(data.colors); } catch { data.colors = []; }
    }
    if (typeof data.sizes === 'string') {
      try { data.sizes = JSON.parse(data.sizes); } catch { data.sizes = []; }
    }
    if (typeof data.colorImages === 'string') {
      try { data.colorImages = JSON.parse(data.colorImages); } catch { data.colorImages = {}; }
    }

    if (files && files.length > 0) {
      const imageUrls = await Promise.all(
        files.map(f => this.cloudinaryService.uploadToCloudinary(f.buffer, 'products'))
      );
      const newUrls = imageUrls.map(r => r.secure_url);
      data.images = newUrls;

      let newImageColorIndexes: Record<string, string> = {};
      if (body.newImageColorIndexes) {
        try { newImageColorIndexes = JSON.parse(body.newImageColorIndexes); } catch {}
      }
      
      const colorImages = data.colorImages || {};
      newUrls.forEach((url, idx) => {
        const color = newImageColorIndexes[idx.toString()];
        if (color) {
          if (!colorImages[color]) colorImages[color] = [];
          colorImages[color].push(url);
        }
      });
      data.colorImages = colorImages;
    }

    if (data.price) data.price = Number(data.price);
    if (data.stock) data.stock = Number(data.stock);
    if (data.pointsPrice) data.pointsPrice = Number(data.pointsPrice);
    if (data.pointsReward) data.pointsReward = Number(data.pointsReward);

    return this.productsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('productImages', 10))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const data = { ...body };

    if (typeof data.colors === 'string') {
      try { data.colors = JSON.parse(data.colors); } catch { data.colors = []; }
    }
    if (typeof data.sizes === 'string') {
      try { data.sizes = JSON.parse(data.sizes); } catch { data.sizes = []; }
    }
    if (typeof data.colorImages === 'string') {
      try { data.colorImages = JSON.parse(data.colorImages); } catch { data.colorImages = {}; }
    }

    if (files && files.length > 0) {
      const imageUrls = await Promise.all(
        files.map(f => this.cloudinaryService.uploadToCloudinary(f.buffer, 'products'))
      );
      const newUrls = imageUrls.map(r => r.secure_url);
      
      let existingImages: string[] = [];
      if (data.existingImages) {
        try { existingImages = JSON.parse(data.existingImages); } catch {}
      }
      data.images = [...existingImages, ...newUrls];

      let newImageColorIndexes: Record<string, string> = {};
      if (body.newImageColorIndexes) {
        try { newImageColorIndexes = JSON.parse(body.newImageColorIndexes); } catch {}
      }

      const colorImages = data.colorImages || {};
      newUrls.forEach((url, idx) => {
        const color = newImageColorIndexes[idx.toString()];
        if (color) {
          if (!colorImages[color]) colorImages[color] = [];
          colorImages[color].push(url);
        }
      });
      data.colorImages = colorImages;
    } else if (data.existingImages) {
      try { data.images = JSON.parse(data.existingImages); } catch {}
    }
    
    delete data.existingImages;
    delete data.newImageColorIndexes;

    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.pointsPrice !== undefined) data.pointsPrice = Number(data.pointsPrice);
    if (data.pointsReward !== undefined) data.pointsReward = Number(data.pointsReward);

    return this.productsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
