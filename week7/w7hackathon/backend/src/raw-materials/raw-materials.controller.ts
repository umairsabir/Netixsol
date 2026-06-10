import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { BulkRestockDto, RestockDto } from './dto/restock.dto';
import { GetStockHistoryFilterDto } from './dto/get-stock-history-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ProductsService } from '../products/products.service';

@Controller('raw-materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RawMaterialsController {
  constructor(
    private readonly rawMaterialsService: RawMaterialsService,
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  @Roles(UserRole.Admin)
  create(@Body() dto: CreateRawMaterialDto) {
    return this.rawMaterialsService.create(dto);
  }

  @Get()
  findAll() {
    return this.rawMaterialsService.findAll();
  }

  @Get('history')
  history(@Query() filter: GetStockHistoryFilterDto) {
    return this.rawMaterialsService.getHistory(filter);
  }

  @Get(':id/history')
  historyByMaterial(
    @Param('id') id: string,
    @Query() filter: GetStockHistoryFilterDto,
  ) {
    return this.rawMaterialsService.getHistory({ ...filter, rawMaterialId: id });
  }

  @Post('bulk-restock')
  @Roles(UserRole.Admin)
  bulkRestockPost(
    @Body() dto: BulkRestockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rawMaterialsService.bulkRestock(dto, user.sub);
  }

  @Patch('bulk-restock')
  @Roles(UserRole.Admin)
  bulkRestock(@Body() dto: BulkRestockDto, @CurrentUser() user: JwtPayload) {
    return this.rawMaterialsService.bulkRestock(dto, user.sub);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateRawMaterialDto) {
    return this.rawMaterialsService.update(id, dto);
  }

  @Patch(':id/restock')
  @Roles(UserRole.Admin)
  restock(
    @Param('id') id: string,
    @Body() dto: RestockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rawMaterialsService.restock(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  async remove(@Param('id') id: string) {
    const recipes = await this.productsService.getAllRecipeRawMaterialIds();
    return this.rawMaterialsService.remove(id, recipes);
  }
}
