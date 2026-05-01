import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';
import { RmqModule, RmqService } from '@ecommerce/shared-rmq';
import { NOTIFICATION_SERVICE } from '@ecommerce/shared-dto';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RmqModule.register({ name: NOTIFICATION_SERVICE }),
  ],
  controllers: [ProductController, CategoryController, InventoryController],
  providers: [ProductService, CategoryService, InventoryService, RmqService],
})
export class ProductModule {}
