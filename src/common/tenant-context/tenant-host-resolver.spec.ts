import { TenantHostResolver } from './tenant-host-resolver';

describe('TenantHostResolver', () => {
  const resolver = new TenantHostResolver();

  it('extracts tenant slug from the production host', () => {
    expect(resolver.resolveTenantSlug('mercado-lima.commercial-saas.com')).toBe(
      'mercado-lima',
    );
  });

  it('extracts tenant slug from localhost and ignores the port', () => {
    expect(resolver.resolveTenantSlug('mercado-lima.localhost:3000')).toBe(
      'mercado-lima',
    );
  });

  it('extracts tenant slug from nip.io and ignores the port', () => {
    expect(
      resolver.resolveTenantSlug('mercado-lima.127.0.0.1.nip.io:3000'),
    ).toBe('mercado-lima');
  });

  it('normalizes the host before validating the slug', () => {
    expect(resolver.resolveTenantSlug('Mercado-Lima.localhost:3000')).toBe(
      'mercado-lima',
    );
  });

  it('returns a request tenant context when a tenant slug is found', () => {
    expect(
      resolver.resolveTenantContext('mercado-lima.localhost:3000'),
    ).toEqual({
      tenantSlug: 'mercado-lima',
    });
  });

  it.each([
    'localhost:3000',
    '127.0.0.1:3000',
    'commercial-saas.com',
    null,
    undefined,
    '',
  ])('returns null for root or missing host %p', (host) => {
    expect(resolver.resolveTenantSlug(host)).toBeNull();
  });

  it.each([
    'mercado_lima.localhost:3000',
    'mercado lima.localhost:3000',
    '-mercado.localhost:3000',
    'mercado-.localhost:3000',
    'mercado--lima.localhost:3000',
    'mercado.lima.localhost:3000',
    '.mercado.localhost:3000',
  ])('returns null for invalid tenant slug host %p', (host) => {
    expect(resolver.resolveTenantSlug(host)).toBeNull();
  });
});
