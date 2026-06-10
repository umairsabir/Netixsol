import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  /** Public: list all categories */
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /** Public: list main (top-level) categories */
  @Get('main')
  findMain() {
    return this.categoriesService.findMainCategories();
  }

  /** Public: subcategories by parentId */
  @Get('sub/:parentId')
  findSub(@Param('parentId') parentId: string) {
    return this.categoriesService.findSubcategories(parentId);
  }

  /** Public: get single category */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  /** Admin: create category */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: any,
    @UploadedFile() image?: Express.Multer.File
  ) {
    let imageUrl = body.imageUrl || '';
    if (image) {
      const result = await this.cloudinaryService.uploadToCloudinary(image.buffer, 'categories');
      imageUrl = result.secure_url;
    } else if (!imageUrl) {
        throw new BadRequestException('Image file is required');
    }

    return this.categoriesService.create({
      ...body,
      imageUrl,
    });
  }

  /** Admin: update category */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string, 
    @Body() body: any,
    @UploadedFile() image?: Express.Multer.File
  ) {
    let payload = { ...body };
    if (image) {
      const result = await this.cloudinaryService.uploadToCloudinary(image.buffer, 'categories');
      payload.imageUrl = result.secure_url;
    }
    return this.categoriesService.update(id, payload);
  }

  /** Admin: delete category */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
