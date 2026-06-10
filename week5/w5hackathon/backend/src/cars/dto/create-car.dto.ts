import {
  IsString, IsNumber, IsOptional, IsBoolean,
  IsEnum, IsDateString, IsNotEmpty, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsNotEmpty() @IsString() title: string;
  @IsNotEmpty() @IsString() make: string;
  @IsNotEmpty() @IsString() model: string;
  @IsNotEmpty() @Type(() => Number) @IsNumber() year: number;
  @IsNotEmpty() @IsString() category: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() vin?: string;
  @IsOptional() @Type(() => Number) @IsNumber() mileage?: number;
  @IsOptional() @IsString() engineSize?: string;
  @IsOptional() @IsString() paint?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasGccSpecs?: boolean;
  @IsOptional() @IsString() noteworthyFeatures?: string;
  @IsOptional() @IsString() accidentHistory?: string;
  @IsOptional() @IsString() fullServiceHistory?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasBeenModified?: boolean;
  @IsNotEmpty() @Type(() => Number) @IsNumber() @Min(0) startingBid: number;
  @IsOptional() @Type(() => Number) @IsNumber() minIncrement?: number;
  @IsOptional() @Type(() => Number) @IsNumber() auctionDuration?: number;
  @IsOptional() @IsDateString() auctionEndDate?: string;
}
