import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { ORDER_PATTERNS } from '@ecommerce/shared-dto';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern(ORDER_PATTERNS.CART_GET)
  async getCart(@Payload() data: { userId: string }) {
    return this.cartService.getCart(data.userId);
  }

  @MessagePattern(ORDER_PATTERNS.CART_ADD_ITEM)
  async addItem(
    @Payload()
    data: {
      userId: string;
      productId: string;
      quantity: number;
      productName?: string;
      price?: number;
      imageUrl?: string;
    },
  ) {
    return this.cartService.addItem(
      data.userId,
      data.productId,
      data.quantity,
      data.productName || '',
      data.price || 0,
      data.imageUrl,
    );
  }

  @MessagePattern(ORDER_PATTERNS.CART_UPDATE_ITEM)
  async updateItem(
    @Payload() data: { userId: string; productId: string; quantity: number },
  ) {
    return this.cartService.updateItem(data.userId, data.productId, data.quantity);
  }

  @MessagePattern(ORDER_PATTERNS.CART_REMOVE_ITEM)
  async removeItem(
    @Payload() data: { userId: string; productId: string },
  ) {
    return this.cartService.removeItem(data.userId, data.productId);
  }

  @MessagePattern(ORDER_PATTERNS.CART_CLEAR)
  async clearCart(@Payload() data: { userId: string }) {
    return this.cartService.clearCart(data.userId);
  }
}
