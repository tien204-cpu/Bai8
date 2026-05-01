import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UserResponseDto,
} from '@ecommerce/shared-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    return this.toResponse(user);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponse(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((u: any) => this.toResponse(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });

    return this.toResponse(user);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    });

    return this.toResponse(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async seedAdmin() {
    const adminEmail = 'admin@shopverse.com';
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: 'System',
          lastName: 'Admin',
          role: 'ADMIN',
        },
      });
      console.log('Seeded default admin user: admin@shopverse.com / admin123');
    }
  }

  private toResponse(user: any): UserResponseDto {
    const { passwordHash, ...rest } = user;
    return rest as UserResponseDto;
  }
}
