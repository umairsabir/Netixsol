import { IsNotEmpty, IsArray, IsString, IsNumber, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  variantId?: string; // Legacy support

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  usePoints?: boolean;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNotEmpty()
  shippingAddress: {
    address: string;
    city: string;
    phone: string;
  };

  @IsString()
  @IsOptional()
  stripeSessionId?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status: string;

  @IsEnum(['pending', 'paid', 'failed', 'refunded'])
  @IsOptional()
  paymentStatus?: string;
}
