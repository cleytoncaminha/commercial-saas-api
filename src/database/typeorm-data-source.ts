import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { TenantEntity } from '../modules/tenants/entities/tenant.entity';
import { UserEntity } from '../modules/users/entities/user.entity';

const DEFAULT_DATABASE_HOST = 'localhost';
const DEFAULT_DATABASE_PORT = 5432;
const DEFAULT_DATABASE_USER = 'commercial_user';
const DEFAULT_DATABASE_PASSWORD = 'commercial_pass';
const DEFAULT_DATABASE_NAME = 'commercial_saas';

loadEnvFile();

function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return;
  }

  const envContent = readFileSync(envPath, 'utf8');

  for (const line of envContent.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();

    if (key.length === 0 || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripQuotes(
      trimmedLine.slice(separatorIndex + 1).trim(),
    );
  }
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function readString(key: string, defaultValue: string): string {
  const value = process.env[key]?.trim();

  return value !== undefined && value.length > 0 ? value : defaultValue;
}

function readPort(key: string, defaultValue: number): number {
  const value = process.env[key]?.trim();
  const port =
    value !== undefined && value.length > 0 ? Number(value) : defaultValue;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${key} must be a valid TCP port`);
  }

  return port;
}

export default new DataSource({
  type: 'postgres',
  host: readString('DATABASE_HOST', DEFAULT_DATABASE_HOST),
  port: readPort('DATABASE_PORT', DEFAULT_DATABASE_PORT),
  username: readString('DATABASE_USER', DEFAULT_DATABASE_USER),
  password: readString('DATABASE_PASSWORD', DEFAULT_DATABASE_PASSWORD),
  database: readString('DATABASE_NAME', DEFAULT_DATABASE_NAME),
  entities: [TenantEntity, UserEntity],
  migrations: [resolve(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});
