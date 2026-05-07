import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common';

@Entity({ name: 'tenants', schema: 'public' })
export class TenantEntity extends BaseEntity {
  @ApiProperty({ example: 'Mercado Lima' })
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @ApiProperty({ example: 'mercado-lima' })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  slug!: string;

  @ApiProperty({ example: 'tenant_mercado_lima' })
  @Index({ unique: true })
  @Column({ name: 'schema_name', type: 'varchar', length: 100 })
  schemaName!: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
