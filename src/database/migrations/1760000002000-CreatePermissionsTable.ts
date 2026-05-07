import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionsTable1760000002000 implements MigrationInterface {
  name = 'CreatePermissionsTable1760000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."permissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar(80) NOT NULL,
        "name" varchar(120) NOT NULL,
        "description" varchar(255),
        "module" varchar(80) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_permissions_code" UNIQUE ("code")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "public"."permissions"');
  }
}
