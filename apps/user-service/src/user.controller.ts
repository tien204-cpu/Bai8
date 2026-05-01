import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { USER_PATTERNS, UpdateUserDto, UpdateUserRoleDto } from '@ecommerce/shared-dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(USER_PATTERNS.GET_PROFILE)
  async getProfile(@Payload() data: { userId: string }) {
    return this.userService.findById(data.userId);
  }

  @MessagePattern(USER_PATTERNS.UPDATE_PROFILE)
  async updateProfile(@Payload() data: { userId: string } & UpdateUserDto) {
    const { userId, ...dto } = data;
    return this.userService.updateProfile(userId, dto);
  }

  @MessagePattern(USER_PATTERNS.FIND_ALL)
  async findAll(@Payload() data: { page?: number; limit?: number }) {
    return this.userService.findAll(data.page, data.limit);
  }

  @MessagePattern(USER_PATTERNS.FIND_ONE)
  async findOne(@Payload() data: { userId: string }) {
    return this.userService.findById(data.userId);
  }

  @MessagePattern(USER_PATTERNS.UPDATE_ROLE)
  async updateRole(@Payload() data: { userId: string; role: string }) {
    return this.userService.updateRole(data.userId, { role: data.role } as UpdateUserRoleDto);
  }

  @MessagePattern(USER_PATTERNS.DELETE)
  async delete(@Payload() data: { userId: string }) {
    await this.userService.delete(data.userId);
    return { success: true };
  }
}
