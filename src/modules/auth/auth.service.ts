import { UnauthorizedException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { UserEntity } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { LoginResponse, LoginUserResponse } from './types/login-response.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantsRepository: Repository<TenantEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(tenantSlug: string, loginDto: LoginDto): Promise<LoginResponse> {
    const tenant = await this.tenantsRepository.findOne({
      where: {
        slug: tenantSlug,
      },
    });

    if (tenant === null || !tenant.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('user.email = :email', {
        email: this.normalizeEmail(loginDto.email),
      })
      .getOne();

    if (user === null || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      schemaName: tenant.schemaName,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toLoginUserResponse(user, tenant),
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toLoginUserResponse(
    user: UserEntity,
    tenant: TenantEntity,
  ): LoginUserResponse {
    return {
      id: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      schemaName: tenant.schemaName,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
