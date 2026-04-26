import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthEmailConfirmationTokens1766763000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "auth_email_confirmation_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(128) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_auth_email_confirmation_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_auth_email_confirmation_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_auth_email_confirmation_tokens_token_hash"
      ON "auth_email_confirmation_tokens" ("token_hash")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auth_email_confirmation_tokens_user_id"
      ON "auth_email_confirmation_tokens" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_auth_email_confirmation_tokens_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_auth_email_confirmation_tokens_token_hash"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_email_confirmation_tokens"`);
  }
}

