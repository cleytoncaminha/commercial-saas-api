const DEFAULT_PORT = 3000;
const DEFAULT_DATABASE_PORT = 5432;
const DEFAULT_NODE_ENV = 'development';
const DEFAULT_DATABASE_HOST = 'localhost';
const DEFAULT_DATABASE_USER = 'commercial_user';
const DEFAULT_DATABASE_PASSWORD = 'commercial_pass';
const DEFAULT_DATABASE_NAME = 'commercial_saas';

function readString(
  config: Record<string, unknown>,
  key: string,
  defaultValue: string,
): string {
  const value = config[key];

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return defaultValue;
}

function readRequiredString(
  config: Record<string, unknown>,
  key: string,
): string {
  const value = config[key];

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  throw new Error(`${key} is required`);
}

function readPort(
  config: Record<string, unknown>,
  key: string,
  defaultValue: number,
): number {
  const value = config[key];
  const port =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim().length > 0
        ? Number(value)
        : defaultValue;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${key} must be a valid TCP port`);
  }

  return port;
}

function readDatabasePassword(
  config: Record<string, unknown>,
  nodeEnv: string,
): string {
  const value = config.DATABASE_PASSWORD;

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (nodeEnv === 'development') {
    return DEFAULT_DATABASE_PASSWORD;
  }

  throw new Error('DATABASE_PASSWORD is required outside development');
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = readString(config, 'NODE_ENV', DEFAULT_NODE_ENV);

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: readPort(config, 'PORT', DEFAULT_PORT),
    DATABASE_HOST: readString(config, 'DATABASE_HOST', DEFAULT_DATABASE_HOST),
    DATABASE_PORT: readPort(config, 'DATABASE_PORT', DEFAULT_DATABASE_PORT),
    DATABASE_USER: readString(config, 'DATABASE_USER', DEFAULT_DATABASE_USER),
    DATABASE_PASSWORD: readDatabasePassword(config, nodeEnv),
    DATABASE_NAME: readString(config, 'DATABASE_NAME', DEFAULT_DATABASE_NAME),
    JWT_SECRET: readRequiredString(config, 'JWT_SECRET'),
  };
}
