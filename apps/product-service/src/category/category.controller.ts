import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { PRODUCT_PATTERNS, CreateCategoryDto, UpdateCategoryDto } from '@ecommerce/shared-dto';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY_CREATE)
  async create(@Payload() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY_FIND_ALL)
  async findAll() {
    return this.categoryService.findAll();
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY_FIND_ONE)
  async findOne(@Payload() data: { categoryId: string }) {
    return this.categoryService.findOne(data.categoryId);
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY_UPDATE)
  async update(@Payload() data: { categoryId: string } & UpdateCategoryDto) {
    const { categoryId, ...dto } = data;
    return this.categoryService.update(categoryId, dto);
  }

  @MessagePattern(PRODUCT_PATTERNS.CATEGORY_DELETE)
  async delete(@Payload() data: { categoryId: string }) {
    return this.categoryService.delete(data.categoryId);
  }
}
