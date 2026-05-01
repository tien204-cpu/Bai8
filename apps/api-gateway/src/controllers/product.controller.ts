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
  PRODUCT_SERVICE,
  PRODUCT_PATTERNS,
  Role,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateInventoryDto,
} from '@ecommerce/shared-dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@ecommerce/shared-auth';

@Controller()
export class ProductGatewayController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  // ==================== Products ====================

  @Get('products')
  async findAllProducts(@Query() filters: ProductFilterDto) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.FIND_ALL, filters)
        .pipe(timeout(5000)),
    );
  }

  @Get('products/:id')
  async findOneProduct(@Param('id') id: string) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.FIND_ONE, { productId: id })
        .pipe(timeout(5000)),
    );
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createProduct(@Body() dto: CreateProductDto) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.CREATE, dto)
        .pipe(timeout(5000)),
    );
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.UPDATE, { productId: id, ...dto })
        .pipe(timeout(5000)),
    );
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteProduct(@Param('id') id: string) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.DELETE, { productId: id })
        .pipe(timeout(5000)),
    );
  }

  // ==================== Categories ====================

  @Get('categories')
  async findAllCategories() {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.CATEGORY_FIND_ALL, {})
        .pipe(timeout(5000)),
    );
  }

  @Get('categories/:id')
  async findOneCategory(@Param('id') id: string) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.CATEGORY_FIND_ONE, { categoryId: id })
        .pipe(timeout(5000)),
    );
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.CATEGORY_CREATE, dto)
        .pipe(timeout(5000)),
    );
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.CATEGORY_UPDATE, { categoryId: id, ...dto })
        .pipe(timeout(5000)),
    );
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCategory(@Param('id') id: string) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.CATEGORY_DELETE, { categoryId: id })
        .pipe(timeout(5000)),
    );
  }

  // ==================== Inventory (Admin) ====================

  @Get('inventory/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getInventory(@Param('productId') productId: string) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.GET_INVENTORY, { productId })
        .pipe(timeout(5000)),
    );
  }

  @Put('inventory/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateInventory(
    @Param('productId') productId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return firstValueFrom(
      this.productClient
        .send(PRODUCT_PATTERNS.UPDATE_INVENTORY, { ...dto, productId })
        .pipe(timeout(5000)),
    );
  }
}
