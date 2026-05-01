import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RmqModule } from '@ecommerce/shared-rmq';
import { NOTIFICATION_SERVICE } from '@ecommerce/shared-dto';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    RmqModule.register({ name: NOTIFICATION_SERVICE }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
