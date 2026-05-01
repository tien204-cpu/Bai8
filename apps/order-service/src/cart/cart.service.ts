import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { CartItemDetailDto } from '@ecommerce/shared-dto';

@Injectable()
export class CartService {
  private readonly redis: Redis;
  private readonly logger = new Logger(CartService.name);
  private readonly CART_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    });
  }

  private cartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string) {
    const key = this.cartKey(userId);
    const cartData = await this.redis.hgetall(key);

    const items: CartItemDetailDto[] = Object.values(cartData).map((item) =>
      JSON.parse(item),
    );

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return { userId, items, total };
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    productName: string,
    price: number,
    imageUrl?: string,
  ) {
    const key = this.cartKey(userId);

    // Check if item already exists
    const existing = await this.redis.hget(key, productId);
    if (existing) {
      const parsed = JSON.parse(existing);
      parsed.quantity += quantity;
      await this.redis.hset(key, productId, JSON.stringify(parsed));
    } else {
      const item: CartItemDetailDto = {
        productId,
        productName,
        price,
        quantity,
        imageUrl,
      };
      await this.redis.hset(key, productId, JSON.stringify(item));
    }

    await this.redis.expire(key, this.CART_TTL);
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const key = this.cartKey(userId);
    const existing = await this.redis.hget(key, productId);

    if (!existing) {
      return this.getCart(userId);
    }

    const parsed = JSON.parse(existing);
    parsed.quantity = quantity;
    await this.redis.hset(key, productId, JSON.stringify(parsed));
    await this.redis.expire(key, this.CART_TTL);

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const key = this.cartKey(userId);
    await this.redis.hdel(key, productId);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const key = this.cartKey(userId);
    await this.redis.del(key);
    return { userId, items: [], total: 0 };
  }
}
