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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import {
  USER_SERVICE,
  USER_PATTERNS,
  Role,
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  JwtPayload,
} from '@ecommerce/shared-dto';
import { JwtAuthGuard, RolesGuard, CurrentUser, Roles } from '@ecommerce/shared-auth';

@Controller()
export class UserGatewayController {
  constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Post('auth/register')
  async register(@Body() dto: CreateUserDto) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.REGISTER, dto).pipe(timeout(5000)),
    );
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.LOGIN, dto).pipe(timeout(5000)),
    );
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.REFRESH_TOKEN, dto).pipe(timeout(5000)),
    );
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.userClient
        .send(USER_PATTERNS.GET_PROFILE, { userId: user.sub })
        .pipe(timeout(5000)),
    );
  }

  @Put('users/me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return firstValueFrom(
      this.userClient
        .send(USER_PATTERNS.UPDATE_PROFILE, { userId: user.sub, ...dto })
        .pipe(timeout(5000)),
    );
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return firstValueFrom(
      this.userClient
        .send(USER_PATTERNS.FIND_ALL, { page: page || 1, limit: limit || 10 })
        .pipe(timeout(5000)),
    );
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findOneUser(@Param('id') id: string) {
    return firstValueFrom(
      this.userClient
        .send(USER_PATTERNS.FIND_ONE, { userId: id })
        .pipe(timeout(5000)),
    );
  }

  @Put('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return firstValueFrom(
      this.userClient
        .send(USER_PATTERNS.UPDATE_ROLE, { userId: id, role: dto.role })
        .pipe(timeout(5000)),
    );
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return firstValueFrom(
      this.userClient
        .send(USER_PATTERNS.DELETE, { userId: id })
        .pipe(timeout(5000)),
    );
  }
}
