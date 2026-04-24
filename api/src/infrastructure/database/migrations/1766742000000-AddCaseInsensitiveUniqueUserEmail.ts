import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCaseInsensitiveUniqueUserEmail1766742000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM "users"
          GROUP BY LOWER("email")
          HAVING COUNT(*) > 1
        ) THEN
          RAISE EXCEPTION 'Cannot create UQ_users_email_lower: duplicated e-mails found';
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email_lower" ON "users" (LOWER("email"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_users_email_lower"`,
    );
  }
}
