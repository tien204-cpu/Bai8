import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReserveInventoryItem } from '@ecommerce/shared-dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventory(productId: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found for this product');
    }

    return {
      ...inventory,
      availableQuantity: inventory.quantity - inventory.reservedQuantity,
    };
  }

  async updateQuantity(productId: string, quantity: number) {
    return this.prisma.inventory.update({
      where: { productId },
      data: { quantity },
    });
  }

  async reserveInventory(items: ReserveInventoryItem[]) {
    // Use a transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });

        if (!inventory) {
          throw new NotFoundException(
            `Inventory not found for product ${item.productId}`,
          );
        }

        const available = inventory.quantity - inventory.reservedQuantity;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}. Available: ${available}, Requested: ${item.quantity}`,
          );
        }

        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            reservedQuantity: { increment: item.quantity },
          },
        });
      }

      return { success: true };
    });
  }

  async releaseInventory(items: ReserveInventoryItem[]) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            reservedQuantity: { decrement: item.quantity },
          },
        });
      }

      return { success: true };
    });
  }

  async confirmInventoryDeduction(items: ReserveInventoryItem[]) {
    // After payment: convert reservation to actual deduction
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            reservedQuantity: { decrement: item.quantity },
          },
        });
      }

      return { success: true };
    });
  }
}
