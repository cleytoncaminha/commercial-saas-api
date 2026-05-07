import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserResponse } from './types/user-response.type';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantsRepository: Repository<TenantEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    await this.ensureTenantExists(createUserDto.tenantId);
    await this.ensureEmailIsAvailable(
      createUserDto.tenantId,
      createUserDto.email,
    );

    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      PASSWORD_SALT_ROUNDS,
    );

    const user = this.usersRepository.create({
      tenantId: createUserDto.tenantId,
      name: createUserDto.name,
      email: this.normalizeEmail(createUserDto.email),
      passwordHash,
      role: createUserDto.role ?? UserRole.MEMBER,
    });

    const savedUser = await this.usersRepository.save(user);

    return this.toUserResponse(savedUser);
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) => this.toUserResponse(user));
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async findByEmailAndTenant(
    email: string,
    tenantId: string,
  ): Promise<UserResponse | null> {
    const user = await this.usersRepository.findOne({
      where: {
        email: this.normalizeEmail(email),
        tenantId,
      },
    });

    return user === null ? null : this.toUserResponse(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.findEntityById(id);

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.role !== undefined) {
      user.role = updateUserDto.role;
    }

    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    const savedUser = await this.usersRepository.save(user);

    return this.toUserResponse(savedUser);
  }

  private async ensureTenantExists(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      select: {
        id: true,
      },
    });

    if (tenant === null) {
      throw new NotFoundException('Tenant not found');
    }
  }

  private async ensureEmailIsAvailable(
    tenantId: string,
    email: string,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        tenantId,
        email: this.normalizeEmail(email),
      },
      select: {
        id: true,
      },
    });

    if (existingUser !== null) {
      throw new ConflictException('User email already exists for this tenant');
    }
  }

  private async findEntityById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toUserResponse(user: UserEntity): UserResponse {
    return {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
