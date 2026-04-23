import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwoFactorPurpose1766655300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE auth_two_factor_purpose_enum AS ENUM ('LOGIN', 'PASSWORD_RECOVERY')`,
    );

    await queryRunner.query(
      `ALTER TABLE "auth_two_factor_codes" ADD COLUMN "purpose" auth_two_factor_purpose_enum NOT NULL DEFAULT 'LOGIN'`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_auth_two_factor_codes_user_purpose" ON "auth_two_factor_codes" ("user_id", "purpose")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_auth_two_factor_codes_user_purpose"`,
    );

    await queryRunner.query(
      `ALTER TABLE "auth_two_factor_codes" DROP COLUMN "purpose"`,
    );

    await queryRunner.query(
      `DROP TYPE auth_two_factor_purpose_enum`,
    );
  }
}

