import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductRecipeDto {
  @IsMongoId()
  rawMaterialId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRecipeDto)
  recipe: ProductRecipeDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
