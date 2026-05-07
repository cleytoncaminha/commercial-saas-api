import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTables1760000003000 implements MigrationInterface {
  name = 'CreateRolesTables1760000003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" varchar(120) NOT NULL,
        "code" varchar(80) NOT NULL,
        "description" varchar(255),
        "is_system" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_tenant_code" UNIQUE ("tenant_id", "code"),
        CONSTRAINT "FK_roles_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "public"."tenants"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role_id" FOREIGN KEY ("role_id")
          REFERENCES "public"."roles"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission_id" FOREIGN KEY ("permission_id")
          REFERENCES "public"."permissions"("id")
          ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "public"."role_permissions"');
    await queryRunner.query('DROP TABLE IF EXISTS "public"."roles"');
  }
}
