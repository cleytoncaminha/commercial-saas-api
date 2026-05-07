export enum PermissionCode {
  ADMIN_ALL = 'admin.all',
  PERMISSIONS_READ = 'permissions.read',
  ROLES_READ = 'roles.read',
  ROLES_CREATE = 'roles.create',
  ROLES_UPDATE = 'roles.update',
  ROLES_DELETE = 'roles.delete',
  ROLES_ASSIGN = 'roles.assign',
  USERS_READ = 'users.read',
  USERS_CREATE = 'users.create',
  USERS_UPDATE = 'users.update',
  USERS_DISABLE = 'users.disable',
  MEMBERSHIPS_READ = 'memberships.read',
  MEMBERSHIPS_MANAGE = 'memberships.manage',
  CUSTOMERS_READ = 'customers.read',
  CUSTOMERS_CREATE = 'customers.create',
  CUSTOMERS_UPDATE = 'customers.update',
  CUSTOMERS_DELETE = 'customers.delete',
  PRODUCTS_READ = 'products.read',
  PRODUCTS_CREATE = 'products.create',
  PRODUCTS_UPDATE = 'products.update',
  PRODUCTS_DELETE = 'products.delete',
  SALES_READ = 'sales.read',
  SALES_CREATE = 'sales.create',
  SALES_CANCEL = 'sales.cancel',
  DASHBOARD_READ = 'dashboard.read',
}

export interface DefaultPermissionDefinition {
  code: PermissionCode;
  name: string;
  description: string | null;
  module: string;
}

// Permissoes sao um catalogo global controlado pelo sistema; tenants apenas usam esses codigos via roles.
export const DEFAULT_PERMISSIONS: DefaultPermissionDefinition[] = [
  {
    code: PermissionCode.ADMIN_ALL,
    name: 'Full admin access',
    description: 'Allows all permission checks.',
    module: 'admin',
  },
  {
    code: PermissionCode.PERMISSIONS_READ,
    name: 'Read permissions',
    description: 'Allows listing the permissions catalog.',
    module: 'permissions',
  },
  {
    code: PermissionCode.ROLES_READ,
    name: 'Read roles',
    description: 'Allows viewing tenant roles.',
    module: 'roles',
  },
  {
    code: PermissionCode.ROLES_CREATE,
    name: 'Create roles',
    description: 'Allows creating tenant roles.',
    module: 'roles',
  },
  {
    code: PermissionCode.ROLES_UPDATE,
    name: 'Update roles',
    description: 'Allows updating tenant roles.',
    module: 'roles',
  },
  {
    code: PermissionCode.ROLES_DELETE,
    name: 'Delete roles',
    description: 'Allows deleting tenant roles.',
    module: 'roles',
  },
  {
    code: PermissionCode.ROLES_ASSIGN,
    name: 'Assign roles',
    description: 'Allows assigning roles to memberships.',
    module: 'roles',
  },
  {
    code: PermissionCode.USERS_READ,
    name: 'Read users',
    description: 'Allows viewing users.',
    module: 'users',
  },
  {
    code: PermissionCode.USERS_CREATE,
    name: 'Create users',
    description: 'Allows creating users.',
    module: 'users',
  },
  {
    code: PermissionCode.USERS_UPDATE,
    name: 'Update users',
    description: 'Allows updating users.',
    module: 'users',
  },
  {
    code: PermissionCode.USERS_DISABLE,
    name: 'Disable users',
    description: 'Allows disabling users.',
    module: 'users',
  },
  {
    code: PermissionCode.MEMBERSHIPS_READ,
    name: 'Read memberships',
    description: 'Allows viewing tenant memberships.',
    module: 'memberships',
  },
  {
    code: PermissionCode.MEMBERSHIPS_MANAGE,
    name: 'Manage memberships',
    description: 'Allows managing tenant memberships.',
    module: 'memberships',
  },
  {
    code: PermissionCode.CUSTOMERS_READ,
    name: 'Read customers',
    description: 'Allows viewing customers.',
    module: 'customers',
  },
  {
    code: PermissionCode.CUSTOMERS_CREATE,
    name: 'Create customers',
    description: 'Allows creating customers.',
    module: 'customers',
  },
  {
    code: PermissionCode.CUSTOMERS_UPDATE,
    name: 'Update customers',
    description: 'Allows updating customers.',
    module: 'customers',
  },
  {
    code: PermissionCode.CUSTOMERS_DELETE,
    name: 'Delete customers',
    description: 'Allows deleting customers.',
    module: 'customers',
  },
  {
    code: PermissionCode.PRODUCTS_READ,
    name: 'Read products',
    description: 'Allows viewing products.',
    module: 'products',
  },
  {
    code: PermissionCode.PRODUCTS_CREATE,
    name: 'Create products',
    description: 'Allows creating products.',
    module: 'products',
  },
  {
    code: PermissionCode.PRODUCTS_UPDATE,
    name: 'Update products',
    description: 'Allows updating products.',
    module: 'products',
  },
  {
    code: PermissionCode.PRODUCTS_DELETE,
    name: 'Delete products',
    description: 'Allows deleting products.',
    module: 'products',
  },
  {
    code: PermissionCode.SALES_READ,
    name: 'Read sales',
    description: 'Allows viewing sales.',
    module: 'sales',
  },
  {
    code: PermissionCode.SALES_CREATE,
    name: 'Create sales',
    description: 'Allows creating sales.',
    module: 'sales',
  },
  {
    code: PermissionCode.SALES_CANCEL,
    name: 'Cancel sales',
    description: 'Allows canceling sales.',
    module: 'sales',
  },
  {
    code: PermissionCode.DASHBOARD_READ,
    name: 'Read dashboard',
    description: 'Allows viewing dashboard metrics.',
    module: 'dashboard',
  },
];
