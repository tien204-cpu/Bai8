import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern, Ctx, RmqContext } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import {
  USER_PATTERNS,
  EVENT_PATTERNS,
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
} from '@ecommerce/shared-dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(USER_PATTERNS.REGISTER)
  async register(@Payload() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @MessagePattern(USER_PATTERNS.LOGIN)
  async login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern(USER_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
