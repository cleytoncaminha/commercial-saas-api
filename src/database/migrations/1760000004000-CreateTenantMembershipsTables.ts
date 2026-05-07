import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantMembershipsTables1760000004000 implements MigrationInterface {
  name = 'CreateTenantMembershipsTables1760000004000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."tenant_memberships" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_memberships_tenant_user" UNIQUE ("tenant_id", "user_id"),
        CONSTRAINT "FK_tenant_memberships_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "public"."tenants"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_tenant_memberships_user_id" FOREIGN KEY ("user_id")
          REFERENCES "public"."users"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."membership_roles" (
        "membership_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "PK_membership_roles" PRIMARY KEY ("membership_id", "role_id"),
        CONSTRAINT "FK_membership_roles_membership_id" FOREIGN KEY ("membership_id")
          REFERENCES "public"."tenant_memberships"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_membership_roles_role_id" FOREIGN KEY ("role_id")
          REFERENCES "public"."roles"("id")
          ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "public"."membership_roles"');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "public"."tenant_memberships"',
    );
  }
}
