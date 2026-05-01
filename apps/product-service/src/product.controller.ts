import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import {
  PRODUCT_PATTERNS,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
} from '@ecommerce/shared-dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern(PRODUCT_PATTERNS.CREATE)
  async create(@Payload() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @MessagePattern(PRODUCT_PATTERNS.FIND_ALL)
  async findAll(@Payload() filters: ProductFilterDto) {
    return this.productService.findAll(filters);
  }

  @MessagePattern(PRODUCT_PATTERNS.FIND_ONE)
  async findOne(@Payload() data: { productId: string }) {
    return this.productService.findOne(data.productId);
  }

  @MessagePattern(PRODUCT_PATTERNS.UPDATE)
  async update(@Payload() data: { productId: string } & UpdateProductDto) {
    const { productId, ...dto } = data;
    return this.productService.update(productId, dto);
  }

  @MessagePattern(PRODUCT_PATTERNS.DELETE)
  async delete(@Payload() data: { productId: string }) {
    return this.productService.delete(data.productId);
  }

  @MessagePattern(PRODUCT_PATTERNS.SEARCH)
  async search(@Payload() data: { query: string; page?: number; limit?: number }) {
    return this.productService.findAll({
      search: data.query,
      page: data.page,
      limit: data.limit,
    });
  }
}
