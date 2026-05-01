import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  ORDER_SERVICE,
  ORDER_PATTERNS,
  Role,
  CartItemDto,
  UpdateCartItemDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
  JwtPayload,
} from '@ecommerce/shared-dto';
import { JwtAuthGuard, RolesGuard, CurrentUser, Roles } from '@ecommerce/shared-auth';

@Controller()
export class OrderGatewayController {
  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  // ==================== Cart ====================

  @Get('cart')
  @UseGuards(JwtAuthGuard)
  async getCart(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.CART_GET, { userId: user.sub })
        .pipe(timeout(5000)),
    );
  }

  @Post('cart/items')
  @UseGuards(JwtAuthGuard)
  async addCartItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CartItemDto,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.CART_ADD_ITEM, { userId: user.sub, ...dto })
        .pipe(timeout(5000)),
    );
  }

  @Put('cart/items/:productId')
  @UseGuards(JwtAuthGuard)
  async updateCartItem(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.CART_UPDATE_ITEM, {
          userId: user.sub,
          productId,
          ...dto,
        })
        .pipe(timeout(5000)),
    );
  }

  @Delete('cart/items/:productId')
  @UseGuards(JwtAuthGuard)
  async removeCartItem(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.CART_REMOVE_ITEM, {
          userId: user.sub,
          productId,
        })
        .pipe(timeout(5000)),
    );
  }

  @Delete('cart')
  @UseGuards(JwtAuthGuard)
  async clearCart(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.CART_CLEAR, { userId: user.sub })
        .pipe(timeout(5000)),
    );
  }

  // ==================== Orders ====================

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.CREATE, { userId: user.sub, ...dto })
        .pipe(timeout(10000)),
    );
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.FIND_BY_USER, {
          userId: user.sub,
          page: page || 1,
          limit: limit || 10,
        })
        .pipe(timeout(5000)),
    );
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async findOneOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.FIND_ONE, { orderId: id, userId: user.sub })
        .pipe(timeout(5000)),
    );
  }

  // ==================== Admin Orders ====================

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.FIND_ALL, {
          page: page || 1,
          limit: limit || 10,
          status,
        })
        .pipe(timeout(5000)),
    );
  }

  @Put('orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return firstValueFrom(
      this.orderClient
        .send(ORDER_PATTERNS.UPDATE_STATUS, { orderId: id, ...dto })
        .pipe(timeout(5000)),
    );
  }
}
