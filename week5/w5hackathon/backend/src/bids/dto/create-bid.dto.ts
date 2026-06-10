import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateBidDto {
  @IsNotEmpty()
  @IsString()
  carId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}
