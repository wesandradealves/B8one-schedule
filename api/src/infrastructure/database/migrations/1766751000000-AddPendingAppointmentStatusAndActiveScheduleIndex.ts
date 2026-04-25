import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPendingAppointmentStatusAndActiveScheduleIndex1766751000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE TYPE "appointment_status_enum_new" AS ENUM ('SCHEDULED', 'CANCELLED', 'PENDING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "appointment_status_enum_new" USING "status"::text::"appointment_status_enum_new"`,
    );
    await queryRunner.query(`DROP TYPE "appointment_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "appointment_status_enum_new" RENAME TO "appointment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING'`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_appointments_exam_schedule"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_appointments_exam_schedule_active" ON "appointments" ("exam_id", "scheduled_at") WHERE "status" IN ('PENDING', 'SCHEDULED')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_appointments_exam_schedule_active"`,
    );

    await queryRunner.query(
      `UPDATE "appointments" SET "status" = 'SCHEDULED' WHERE "status" = 'PENDING'`,
    );
    await queryRunner.query(`
      WITH "ranked_appointments" AS (
        SELECT
          "id",
          ROW_NUMBER() OVER (
            PARTITION BY "exam_id", "scheduled_at"
            ORDER BY
              CASE WHEN "status" = 'SCHEDULED' THEN 0 ELSE 1 END,
              "updated_at" DESC,
              "created_at" DESC,
              "id" DESC
          ) AS "rank"
        FROM "appointments"
      )
      DELETE FROM "appointments" AS "appointment"
      USING "ranked_appointments"
      WHERE "appointment"."id" = "ranked_appointments"."id"
        AND "ranked_appointments"."rank" > 1
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_appointments_exam_schedule" ON "appointments" ("exam_id", "scheduled_at")`,
    );

    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE TYPE "appointment_status_enum_old" AS ENUM ('SCHEDULED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "appointment_status_enum_old" USING "status"::text::"appointment_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "appointment_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "appointment_status_enum_old" RENAME TO "appointment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'`,
    );
  }
}
