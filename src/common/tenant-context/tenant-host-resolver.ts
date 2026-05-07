import { RequestTenantContext } from './request-tenant-context.interface';

const TENANT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRODUCTION_DOMAIN = ['commercial-saas', 'com'];
const LOCALHOST_DOMAIN = ['localhost'];
const NIP_IO_DOMAIN = ['127', '0', '0', '1', 'nip', 'io'];

export class TenantHostResolver {
  resolveTenantContext(
    hostHeader: string | null | undefined,
  ): RequestTenantContext | null {
    const tenantSlug = this.resolveTenantSlug(hostHeader);

    if (tenantSlug === null) {
      return null;
    }

    return { tenantSlug };
  }

  resolveTenantSlug(hostHeader: string | null | undefined): string | null {
    const host = this.normalizeHost(hostHeader);

    if (host === null) {
      return null;
    }

    const tenantSlug = this.extractSupportedTenantSlug(host);

    if (tenantSlug === null || !TENANT_SLUG_REGEX.test(tenantSlug)) {
      return null;
    }

    return tenantSlug;
  }

  private normalizeHost(hostHeader: string | null | undefined): string | null {
    const host = hostHeader?.trim().toLowerCase();

    if (host === undefined || host.length === 0) {
      return null;
    }

    const [hostname] = host.split(':');

    return hostname.length > 0 ? hostname : null;
  }

  private extractSupportedTenantSlug(host: string): string | null {
    const labels = host.split('.');

    if (labels.some((label) => label.length === 0)) {
      return null;
    }

    return (
      this.extractSlugFromDomain(labels, PRODUCTION_DOMAIN) ??
      this.extractSlugFromDomain(labels, LOCALHOST_DOMAIN) ??
      this.extractSlugFromDomain(labels, NIP_IO_DOMAIN)
    );
  }

  private extractSlugFromDomain(
    labels: string[],
    domainLabels: string[],
  ): string | null {
    if (labels.length !== domainLabels.length + 1) {
      return null;
    }

    const tenantSlug = labels[0];
    const baseDomain = labels.slice(1);
    const isSupportedDomain = baseDomain.every(
      (label, index) => label === domainLabels[index],
    );

    return isSupportedDomain ? tenantSlug : null;
  }
}
