import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExamAvailabilityColumns1766760000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exams" ADD COLUMN "available_weekdays" jsonb NOT NULL DEFAULT '[1,2,3,4,5]'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" ADD COLUMN "available_start_time" varchar(5) NOT NULL DEFAULT '07:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" ADD COLUMN "available_end_time" varchar(5) NOT NULL DEFAULT '19:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" ADD COLUMN "available_from_date" date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" ADD COLUMN "available_to_date" date NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exams" DROP COLUMN "available_to_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" DROP COLUMN "available_from_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" DROP COLUMN "available_end_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" DROP COLUMN "available_start_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exams" DROP COLUMN "available_weekdays"`,
    );
  }
}

