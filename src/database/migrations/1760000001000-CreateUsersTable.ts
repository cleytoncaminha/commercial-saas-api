import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1760000001000 implements MigrationInterface {
  name = 'CreateUsersTable1760000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM ('OWNER', 'ADMIN', 'MEMBER')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" varchar(120) NOT NULL,
        "email" varchar(160) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'MEMBER',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_tenant_email" UNIQUE ("tenant_id", "email"),
        CONSTRAINT "FK_users_tenant_id" FOREIGN KEY ("tenant_id")
          REFERENCES "public"."tenants"("id")
          ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "public"."users"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."user_role_enum"');
  }
}
