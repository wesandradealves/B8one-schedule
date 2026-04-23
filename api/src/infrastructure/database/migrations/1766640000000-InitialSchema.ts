import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class InitialSchema1766640000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryRunner.query(
      `CREATE TYPE user_profile_enum AS ENUM ('ADMIN', 'CLIENT');`,
    );
    await queryRunner.query(
      `CREATE TYPE appointment_status_enum AS ENUM ('SCHEDULED', 'CANCELLED');`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '320',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'profile',
            type: 'enum',
            enumName: 'user_profile_enum',
            enum: ['ADMIN', 'CLIENT'],
            default: `'CLIENT'`,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: 'true',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'auth_two_factor_codes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
          },
          {
            name: 'used_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'exams',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'duration_minutes',
            type: 'int',
          },
          {
            name: 'price_cents',
            type: 'int',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: 'true',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'exam_id',
            type: 'uuid',
          },
          {
            name: 'scheduled_at',
            type: 'timestamptz',
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'appointment_status_enum',
            enum: ['SCHEDULED', 'CANCELLED'],
            default: `'SCHEDULED'`,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'auth_two_factor_codes',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({
        columnNames: ['exam_id'],
        referencedTableName: 'exams',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'UQ_appointments_exam_schedule',
        columnNames: ['exam_id', 'scheduled_at'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'IDX_appointments_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'auth_two_factor_codes',
      new TableIndex({
        name: 'IDX_auth_two_factor_codes_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'exams',
      new TableIndex({
        name: 'IDX_exams_name',
        columnNames: ['name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('exams', 'IDX_exams_name');
    await queryRunner.dropIndex('auth_two_factor_codes', 'IDX_auth_two_factor_codes_user_id');
    await queryRunner.dropIndex('appointments', 'IDX_appointments_user_id');
    await queryRunner.dropIndex('appointments', 'UQ_appointments_exam_schedule');

    const appointmentsTable = await queryRunner.getTable('appointments');
    if (appointmentsTable) {
      for (const foreignKey of appointmentsTable.foreignKeys) {
        await queryRunner.dropForeignKey('appointments', foreignKey);
      }
    }

    const authTwoFactorTable = await queryRunner.getTable('auth_two_factor_codes');
    if (authTwoFactorTable) {
      for (const foreignKey of authTwoFactorTable.foreignKeys) {
        await queryRunner.dropForeignKey('auth_two_factor_codes', foreignKey);
      }
    }

    await queryRunner.dropTable('appointments');
    await queryRunner.dropTable('exams');
    await queryRunner.dropTable('auth_two_factor_codes');
    await queryRunner.dropTable('users');

    await queryRunner.query('DROP TYPE appointment_status_enum');
    await queryRunner.query('DROP TYPE user_profile_enum');
  }
}
