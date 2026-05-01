import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { OrderService } from './order.service';
import {
  ORDER_PATTERNS,
  EVENT_PATTERNS,
  CreateOrderDto,
  UpdateOrderStatusDto,
} from '@ecommerce/shared-dto';
import { RmqService } from '@ecommerce/shared-rmq';

@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern(ORDER_PATTERNS.CREATE)
  async create(@Payload() data: { userId: string } & CreateOrderDto) {
    const { userId, ...dto } = data;
    return this.orderService.createOrder(userId, dto as CreateOrderDto);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_BY_USER)
  async findByUser(
    @Payload() data: { userId: string; page?: number; limit?: number },
  ) {
    return this.orderService.findByUser(data.userId, data.page, data.limit);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ALL)
  async findAll(
    @Payload() data: { page?: number; limit?: number; status?: string },
  ) {
    return this.orderService.findAll(data.page, data.limit, data.status);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ONE)
  async findOne(@Payload() data: { orderId: string; userId?: string }) {
    return this.orderService.findOne(data.orderId, data.userId);
  }

  @MessagePattern(ORDER_PATTERNS.UPDATE_STATUS)
  async updateStatus(
    @Payload() data: { orderId: string } & UpdateOrderStatusDto,
  ) {
    const { orderId, ...dto } = data;
    return this.orderService.updateStatus(orderId, dto as UpdateOrderStatusDto);
  }

  // Listen for payment.completed -> confirm order
  @EventPattern(EVENT_PATTERNS.PAYMENT_COMPLETED)
  async handlePaymentCompleted(
    @Payload() data: { orderId: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.orderService.confirmOrder(data.orderId);
      this.rmqService.ack(context);
    } catch (error) {
      console.error('Failed to confirm order:', error);
      this.rmqService.ack(context);
    }
  }
}
