import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { PrismaService } from './prisma/prisma.service';
import { CartService } from './cart/cart.service';
import {
  PRODUCT_SERVICE,
  PRODUCT_PATTERNS,
  EVENT_PATTERNS,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderStatus,
} from '@ecommerce/shared-dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
    @Inject('ORDER_RMQ_CLIENT') private readonly rmqClient: ClientProxy,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // 1. Reserve inventory via product-service (sync TCP call)
    const inventoryItems = dto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      await firstValueFrom(
        this.productClient
          .send(PRODUCT_PATTERNS.RESERVE_INVENTORY, { items: inventoryItems })
          .pipe(timeout(5000)),
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to reserve inventory: ${error.message || 'Insufficient stock'}`,
      );
    }

    // 2. Calculate total
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 3. Create order in database
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress: dto.shippingAddress as any,
        note: dto.note,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // 4. Clear cart
    await this.cartService.clearCart(userId);

    // 5. Emit order.created event
    this.rmqClient.emit(EVENT_PATTERNS.ORDER_CREATED, {
      orderId: order.id,
      userId,
      items: dto.items,
      totalAmount,
      shippingAddress: dto.shippingAddress,
    });

    this.logger.log(`Order created: ${order.id} for user: ${userId}`);

    return this.toResponse(order);
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders.map((o) => this.toResponse(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.toResponse(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toResponse(order);
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: { items: true },
    });

    // Emit status update event
    this.rmqClient.emit(EVENT_PATTERNS.ORDER_STATUS_UPDATED, {
      orderId,
      userId: order.userId,
      oldStatus: order.status,
      newStatus: dto.status,
    });

    // If cancelled, emit cancel event to release inventory
    if (dto.status === OrderStatus.CANCELLED) {
      this.rmqClient.emit(EVENT_PATTERNS.ORDER_CANCELLED, {
        orderId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    }

    return this.toResponse(updated);
  }

  // Called when payment is completed
  async confirmOrder(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
      include: { items: true },
    });
  }

  private toResponse(order: any) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      shippingAddress: order.shippingAddress,
      note: order.note,
      items: order.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
