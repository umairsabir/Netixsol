import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RestockDto {
  @IsNumber()
  @Min(0.001)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkRestockItemDto {
  @IsMongoId()
  rawMaterialId: string;

  @IsNumber()
  @Min(0.001)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkRestockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkRestockItemDto)
  items: BulkRestockItemDto[];
}
