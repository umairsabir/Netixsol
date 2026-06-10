import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRawMaterialDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  currentStock: number;

  @IsNumber()
  @Min(0)
  minStockAlert: number;

  @IsOptional()
  @IsString()
  unit?: string;
}
