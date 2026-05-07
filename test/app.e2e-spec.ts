import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { AuthenticatedUserPayload } from '../src/modules/auth/types/jwt-payload.type';
import { PermissionEntity } from '../src/modules/permissions/entities/permission.entity';
import {
  DEFAULT_PERMISSIONS,
  PermissionCode,
} from '../src/modules/permissions/permissions.constants';
import { PermissionsService } from '../src/modules/permissions/permissions.service';
import { TenantMembershipsService } from '../src/modules/tenant-memberships/tenant-memberships.service';

describe('AppController (e2e)', () => {
  const jwtSecret = 'test_jwt_secret';
  const tenantId = '11111111-1111-4111-8111-111111111111';
  const membershipId = '22222222-2222-4222-8222-222222222222';

  let app: INestApplication | undefined;
  let getPermissionCodesForMembership: jest.MockedFunction<
    TenantMembershipsService['getPermissionCodesForMembership']
  >;

  beforeEach(async () => {
    process.env.DATABASE_PASSWORD = 'commercial_pass';
    process.env.JWT_SECRET = jwtSecret;

    getPermissionCodesForMembership = jest.fn();
    const findAllPermissions = jest
      .fn<PermissionsService['findAll']>()
      .mockResolvedValue(createPermissionEntities());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PermissionsService)
      .useValue({
        findAll: findAllPermissions,
      } satisfies Pick<PermissionsService, 'findAll'>)
      .overrideProvider(TenantMembershipsService)
      .useValue({
        getPermissionCodesForMembership,
      } satisfies Pick<
        TenantMembershipsService,
        'getPermissionCodesForMembership'
      >)
      .compile();

    const nestApp = moduleFixture.createNestApplication();
    configureApp(nestApp);
    await nestApp.init();

    app = nestApp;
  });

  it('/api/v1/health (GET)', () => {
    return request(getServer()).get('/api/v1/health').expect(200).expect({
      status: 'ok',
      service: 'commercial-saas-api',
    });
  });

  it('/api/v1/permissions (GET) rejects unauthenticated request', () => {
    return request(getServer()).get('/api/v1/permissions').expect(401);
  });

  it('/api/v1/permissions (GET) allows provisioned owner', async () => {
    // O banco de permissoes fica mockado para o e2e focar na protecao HTTP/RBAC.
    getPermissionCodesForMembership.mockResolvedValue([
      PermissionCode.ADMIN_ALL,
    ]);

    const accessToken = await createAccessToken({
      membershipRole: 'owner',
    });

    const response = await request(getServer())
      .get('/api/v1/permissions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: PermissionCode.ADMIN_ALL,
        }),
      ]),
    );
    expect(getPermissionCodesForMembership).toHaveBeenCalledWith(
      tenantId,
      membershipId,
    );
  });

  it('/api/v1/permissions (GET) denies authenticated user without permission', async () => {
    getPermissionCodesForMembership.mockResolvedValue([
      PermissionCode.DASHBOARD_READ,
    ]);

    const accessToken = await createAccessToken({
      membershipRole: 'member',
    });

    return request(getServer())
      .get('/api/v1/permissions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  afterEach(async () => {
    await app?.close();
  });

  function getServer(): Server {
    if (app === undefined) {
      throw new Error('Application was not initialized');
    }

    return app.getHttpServer() as Server;
  }

  async function createAccessToken(
    overrides: Partial<AuthenticatedUserPayload> = {},
  ): Promise<string> {
    const jwtService = getJwtService();
    const payload: AuthenticatedUserPayload = {
      sub: '33333333-3333-4333-8333-333333333333',
      tenantId,
      tenantSlug: 'mercado-lima',
      schemaName: 'tenant_mercado_lima',
      membershipId,
      membershipRole: 'member',
      ...overrides,
    };

    return jwtService.signAsync(payload);
  }

  function getJwtService(): JwtService {
    if (app === undefined) {
      throw new Error('Application was not initialized');
    }

    return app.get(JwtService, {
      strict: false,
    });
  }
});

function createPermissionEntities(): PermissionEntity[] {
  return DEFAULT_PERMISSIONS.map((permission, index) => ({
    id: `permission-${index}`,
    code: permission.code,
    name: permission.name,
    description: permission.description,
    module: permission.module,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }));
}
