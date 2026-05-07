import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';
import dataSource from '../typeorm-data-source';
import {
  DEFAULT_PERMISSIONS,
  PermissionCode,
} from '../../modules/permissions/permissions.constants';
import { PermissionEntity } from '../../modules/permissions/entities/permission.entity';
import { RoleEntity } from '../../modules/roles';
import { TenantMembershipEntity } from '../../modules/tenant-memberships';
import { TenantEntity } from '../../modules/tenants';
import { UserEntity, UserRole } from '../../modules/users';

interface ProvisionTenantInput {
  name: string;
  slug?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

interface DefaultRoleDefinition {
  name: string;
  code: string;
  description: string;
  permissionCodes: PermissionCode[];
}

const PASSWORD_SALT_ROUNDS = 10;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ADMIN_PERMISSION_CODES = [
  PermissionCode.PERMISSIONS_READ,
  PermissionCode.ROLES_READ,
  PermissionCode.ROLES_CREATE,
  PermissionCode.ROLES_UPDATE,
  PermissionCode.ROLES_DELETE,
  PermissionCode.ROLES_ASSIGN,
  PermissionCode.USERS_READ,
  PermissionCode.USERS_CREATE,
  PermissionCode.USERS_UPDATE,
  PermissionCode.USERS_DISABLE,
  PermissionCode.MEMBERSHIPS_READ,
  PermissionCode.MEMBERSHIPS_MANAGE,
  PermissionCode.CUSTOMERS_READ,
  PermissionCode.CUSTOMERS_CREATE,
  PermissionCode.CUSTOMERS_UPDATE,
  PermissionCode.CUSTOMERS_DELETE,
  PermissionCode.PRODUCTS_READ,
  PermissionCode.PRODUCTS_CREATE,
  PermissionCode.PRODUCTS_UPDATE,
  PermissionCode.PRODUCTS_DELETE,
  PermissionCode.SALES_READ,
  PermissionCode.SALES_CREATE,
  PermissionCode.SALES_CANCEL,
  PermissionCode.DASHBOARD_READ,
];

const MEMBER_PERMISSION_CODES = [
  PermissionCode.CUSTOMERS_READ,
  PermissionCode.PRODUCTS_READ,
  PermissionCode.SALES_READ,
  PermissionCode.DASHBOARD_READ,
];

const DEFAULT_ROLE_DEFINITIONS: DefaultRoleDefinition[] = [
  {
    name: 'Owner',
    code: 'owner',
    description: 'Full tenant administration.',
    permissionCodes: [PermissionCode.ADMIN_ALL],
  },
  {
    name: 'Admin',
    code: 'admin',
    description: 'Common tenant management access.',
    permissionCodes: ADMIN_PERMISSION_CODES,
  },
  {
    name: 'Member',
    code: 'member',
    description: 'Basic read access for daily usage.',
    permissionCodes: MEMBER_PERMISSION_CODES,
  },
];

async function main(): Promise<void> {
  const input = readProvisionInput(process.argv.slice(2));
  await dataSource.initialize();

  try {
    const result = await dataSource.transaction(async (manager) => {
      const permissionsRepository = manager.getRepository(PermissionEntity);
      const tenantsRepository = manager.getRepository(TenantEntity);
      const usersRepository = manager.getRepository(UserEntity);
      const rolesRepository = manager.getRepository(RoleEntity);
      const membershipsRepository = manager.getRepository(
        TenantMembershipEntity,
      );

      await permissionsRepository.upsert(DEFAULT_PERMISSIONS, {
        conflictPaths: ['code'],
        skipUpdateIfNoValuesChanged: true,
      });

      const slug = resolveSlug(input);
      const schemaName = createSchemaName(slug);

      const existingTenant = await tenantsRepository.findOne({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

      if (existingTenant !== null) {
        throw new Error(`Tenant slug already exists: ${slug}`);
      }

      await manager.query(
        `CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schemaName)}`,
      );

      const tenant = await tenantsRepository.save(
        tenantsRepository.create({
          name: input.name,
          slug,
          schemaName,
        }),
      );

      const ownerPasswordHash = await bcrypt.hash(
        input.ownerPassword,
        PASSWORD_SALT_ROUNDS,
      );
      const owner = await usersRepository.save(
        usersRepository.create({
          tenantId: tenant.id,
          name: input.ownerName,
          email: normalizeEmail(input.ownerEmail),
          passwordHash: ownerPasswordHash,
          role: UserRole.OWNER,
        }),
      );

      const defaultRoles: RoleEntity[] = [];
      for (const roleDefinition of DEFAULT_ROLE_DEFINITIONS) {
        const permissions = await permissionsRepository.find({
          where: {
            code: In(roleDefinition.permissionCodes),
          },
        });

        if (permissions.length !== roleDefinition.permissionCodes.length) {
          throw new Error(
            `Missing permissions for role: ${roleDefinition.code}`,
          );
        }

        const role = await rolesRepository.save(
          rolesRepository.create({
            tenantId: tenant.id,
            name: roleDefinition.name,
            code: roleDefinition.code,
            description: roleDefinition.description,
            isSystem: true,
            permissions,
          }),
        );

        defaultRoles.push(role);
      }

      const ownerRole = defaultRoles.find((role) => role.code === 'owner');

      if (ownerRole === undefined) {
        throw new Error('Owner role was not created');
      }

      await membershipsRepository.save(
        membershipsRepository.create({
          tenantId: tenant.id,
          userId: owner.id,
          roles: [ownerRole],
        }),
      );

      return {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        schemaName: tenant.schemaName,
        ownerUserId: owner.id,
      };
    });

    console.log('Tenant provisioned successfully');
    console.log(result);
  } finally {
    await dataSource.destroy();
  }
}

function readProvisionInput(args: string[]): ProvisionTenantInput {
  const values = readNamedArgs(args);
  const name = readRequiredArg(values, 'name');
  const ownerName = readRequiredArg(values, 'owner-name');
  const ownerEmail = readRequiredArg(values, 'owner-email');
  const ownerPassword = readRequiredArg(values, 'owner-password');
  const slug = values.get('slug');

  return {
    name,
    slug,
    ownerName,
    ownerEmail,
    ownerPassword,
  };
}

function readNamedArgs(args: string[]): Map<string, string> {
  const values = new Map<string, string>();

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const value = args[index + 1];

    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    values.set(key, value);
    index += 1;
  }

  return values;
}

function readRequiredArg(values: Map<string, string>, key: string): string {
  const value = values.get(key)?.trim();

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required argument --${key}`);
  }

  return value;
}

function resolveSlug(input: ProvisionTenantInput): string {
  const slug = input.slug ?? createSlug(input.name);

  if (!SLUG_REGEX.test(slug)) {
    throw new Error(`Invalid tenant slug: ${slug}`);
  }

  return slug;
}

function createSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function createSchemaName(slug: string): string {
  return `tenant_${slug.replace(/-/g, '_')}`;
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
