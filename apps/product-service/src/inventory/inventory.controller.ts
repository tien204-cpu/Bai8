import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import {
  PRODUCT_PATTERNS,
  EVENT_PATTERNS,
  ReserveInventoryItem,
  UpdateInventoryDto,
} from '@ecommerce/shared-dto';
import { RmqService } from '@ecommerce/shared-rmq';

@Controller()
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern(PRODUCT_PATTERNS.GET_INVENTORY)
  async getInventory(@Payload() data: { productId: string }) {
    return this.inventoryService.getInventory(data.productId);
  }

  @MessagePattern(PRODUCT_PATTERNS.UPDATE_INVENTORY)
  async updateInventory(@Payload() data: UpdateInventoryDto) {
    return this.inventoryService.updateQuantity(data.productId, data.quantity);
  }

  @MessagePattern(PRODUCT_PATTERNS.RESERVE_INVENTORY)
  async reserveInventory(@Payload() data: { items: ReserveInventoryItem[] }) {
    return this.inventoryService.reserveInventory(data.items);
  }

  @MessagePattern(PRODUCT_PATTERNS.RELEASE_INVENTORY)
  async releaseInventory(@Payload() data: { items: ReserveInventoryItem[] }) {
    return this.inventoryService.releaseInventory(data.items);
  }

  // Listen for payment.completed -> confirm inventory deduction
  @EventPattern(EVENT_PATTERNS.PAYMENT_COMPLETED)
  async handlePaymentCompleted(
    @Payload() data: { orderId: string; items: ReserveInventoryItem[] },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.inventoryService.confirmInventoryDeduction(data.items);
      this.rmqService.ack(context);
    } catch (error) {
      // Log error but still ack to prevent infinite retry
      console.error('Failed to confirm inventory deduction:', error);
      this.rmqService.ack(context);
    }
  }

  // Listen for order.cancelled -> release reserved inventory
  @EventPattern(EVENT_PATTERNS.ORDER_CANCELLED)
  async handleOrderCancelled(
    @Payload() data: { orderId: string; items: ReserveInventoryItem[] },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.inventoryService.releaseInventory(data.items);
      this.rmqService.ack(context);
    } catch (error) {
      console.error('Failed to release inventory:', error);
      this.rmqService.ack(context);
    }
  }

  // Listen for payment.failed -> release reserved inventory
  @EventPattern(EVENT_PATTERNS.PAYMENT_FAILED)
  async handlePaymentFailed(
    @Payload() data: { orderId: string; items: ReserveInventoryItem[] },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.inventoryService.releaseInventory(data.items);
      this.rmqService.ack(context);
    } catch (error) {
      console.error('Failed to release inventory on payment failure:', error);
      this.rmqService.ack(context);
    }
  }
}
