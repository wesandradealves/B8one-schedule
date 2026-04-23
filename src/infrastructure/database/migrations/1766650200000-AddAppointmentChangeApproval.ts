import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppointmentChangeApproval1766650200000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE appointment_change_status_enum AS ENUM ('NONE', 'PENDING')`,
    );

    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN "change_status" appointment_change_status_enum NOT NULL DEFAULT 'NONE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN "requested_exam_id" uuid NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN "requested_scheduled_at" TIMESTAMPTZ NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN "requested_notes" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN "reviewed_by_user_id" uuid NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN "reviewed_at" TIMESTAMPTZ NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_requested_exam" FOREIGN KEY ("requested_exam_id") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_reviewed_by_user" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_change_status" ON "appointments" ("change_status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_appointments_change_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_reviewed_by_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_requested_exam"`,
    );

    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "reviewed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "reviewed_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "requested_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "requested_scheduled_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "requested_exam_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "change_status"`,
    );

    await queryRunner.query(`DROP TYPE appointment_change_status_enum`);
  }
}
