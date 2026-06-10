import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(sessionId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ sessionId });
    if (!cart) {
      cart = await this.cartModel.create({ sessionId, items: [] });
    }
    return cart;
  }

  async addToCart(sessionId: string, item: any): Promise<CartDocument> {
    const cart = await this.getCart(sessionId);
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += item.quantity || 1;
    } else {
      cart.items.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image
      });
    }

    return cart.save();
  }

  async updateItemQuantity(sessionId: string, productId: string, quantity: number): Promise<CartDocument> {
    const cart = await this.getCart(sessionId);
    const item = cart.items.find(i => i.productId === productId);
    
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }
    
    item.quantity = quantity;
    return cart.save();
  }

  async removeItem(sessionId: string, productId: string): Promise<CartDocument> {
    const cart = await this.getCart(sessionId);
    cart.items = cart.items.filter(i => i.productId !== productId);
    return cart.save();
  }
}

