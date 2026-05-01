import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
} from '@ecommerce/shared-dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        sku: dto.sku,
        imageUrls: dto.imageUrls || [],
        categoryId: dto.categoryId,
        inventory: {
          create: {
            quantity: dto.initialStock || 0,
            reservedQuantity: 0,
          },
        },
      },
      include: { category: true, inventory: true },
    });

    return this.toResponse(product);
  }

  async findAll(filters: ProductFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.inStock) {
      where.inventory = { quantity: { gt: 0 } };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = filters.sortBy
      ? { [filters.sortBy]: filters.sortOrder || 'asc' } as Prisma.ProductOrderByWithRelationInput
      : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { category: true, inventory: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.toResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, inventory: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.sku && { sku: dto.sku }),
        ...(dto.imageUrls && { imageUrls: dto.imageUrls }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
      },
      include: { category: true, inventory: true },
    });

    return this.toResponse(product);
  }

  async delete(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private toResponse(product: any) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      sku: product.sku,
      imageUrls: product.imageUrls,
      isActive: product.isActive,
      categoryId: product.categoryId,
      category: product.category,
      stock: product.inventory
        ? product.inventory.quantity - product.inventory.reservedQuantity
        : 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
