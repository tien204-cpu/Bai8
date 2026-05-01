import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { EVENT_PATTERNS } from '@ecommerce/shared-dto';
import { RmqService } from '@ecommerce/shared-rmq';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern(EVENT_PATTERNS.USER_REGISTERED)
  async handleUserRegistered(
    @Payload() data: { userId: string; email: string; firstName: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.notificationService.handleUserRegistered(data);
    } catch (error) {
      this.logger.error(`Error handling user.registered: ${error.message}`);
    }
    this.rmqService.ack(context);
  }

  @EventPattern(EVENT_PATTERNS.ORDER_CREATED)
  async handleOrderCreated(
    @Payload() data: { orderId: string; userId: string; totalAmount: number },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.notificationService.handleOrderCreated(data);
    } catch (error) {
      this.logger.error(`Error handling order.created: ${error.message}`);
    }
    this.rmqService.ack(context);
  }

  @EventPattern(EVENT_PATTERNS.PAYMENT_COMPLETED)
  async handlePaymentCompleted(
    @Payload() data: { paymentId: string; orderId: string; userId: string; amount: number },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.notificationService.handlePaymentCompleted(data);
    } catch (error) {
      this.logger.error(`Error handling payment.completed: ${error.message}`);
    }
    this.rmqService.ack(context);
  }

  @EventPattern(EVENT_PATTERNS.PAYMENT_FAILED)
  async handlePaymentFailed(
    @Payload() data: { paymentId: string; orderId: string; reason: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.notificationService.handlePaymentFailed(data);
    } catch (error) {
      this.logger.error(`Error handling payment.failed: ${error.message}`);
    }
    this.rmqService.ack(context);
  }

  @EventPattern(EVENT_PATTERNS.ORDER_STATUS_UPDATED)
  async handleOrderStatusUpdated(
    @Payload() data: { orderId: string; userId: string; oldStatus: string; newStatus: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.notificationService.handleOrderStatusUpdated(data);
    } catch (error) {
      this.logger.error(`Error handling order.status_updated: ${error.message}`);
    }
    this.rmqService.ack(context);
  }

  @EventPattern(EVENT_PATTERNS.ORDER_CANCELLED)
  async handleOrderCancelled(
    @Payload() data: { orderId: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.notificationService.handleOrderCancelled(data);
    } catch (error) {
      this.logger.error(`Error handling order.cancelled: ${error.message}`);
    }
    this.rmqService.ack(context);
  }
}
