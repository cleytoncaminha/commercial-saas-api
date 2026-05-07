import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';

const TENANT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantsRepository: Repository<TenantEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantEntity> {
    const slug = this.resolveSlug(createTenantDto);
    await this.ensureSlugIsAvailable(slug);

    const schemaName = this.createSchemaName(slug);
    await this.createTenantSchema(schemaName);

    const tenant = this.tenantsRepository.create({
      name: createTenantDto.name,
      slug,
      schemaName,
    });

    return this.tenantsRepository.save(tenant);
  }

  findAll(): Promise<TenantEntity[]> {
    return this.tenantsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
    });

    if (tenant === null) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<TenantEntity> {
    const tenant = await this.findOne(id);

    if (updateTenantDto.name !== undefined) {
      tenant.name = updateTenantDto.name;
    }

    if (updateTenantDto.isActive !== undefined) {
      tenant.isActive = updateTenantDto.isActive;
    }

    return this.tenantsRepository.save(tenant);
  }

  private resolveSlug(createTenantDto: CreateTenantDto): string {
    if (createTenantDto.slug !== undefined) {
      return createTenantDto.slug;
    }

    const slug = createTenantDto.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');

    if (!TENANT_SLUG_REGEX.test(slug)) {
      throw new BadRequestException('Tenant slug could not be generated');
    }

    return slug;
  }

  private async ensureSlugIsAvailable(slug: string): Promise<void> {
    const existingTenant = await this.tenantsRepository.findOne({
      where: { slug },
      select: {
        id: true,
      },
    });

    if (existingTenant !== null) {
      throw new ConflictException('Tenant slug already exists');
    }
  }

  private createSchemaName(slug: string): string {
    return `tenant_${slug.replace(/-/g, '_')}`;
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(
      `CREATE SCHEMA IF NOT EXISTS ${this.quoteIdentifier(schemaName)}`,
    );
  }

  private quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }
}
