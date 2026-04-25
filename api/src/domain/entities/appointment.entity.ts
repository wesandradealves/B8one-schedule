import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { BaseEntity } from '@/domain/entities/commons/base.entity';
import { ExamEntity } from '@/domain/entities/exam.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('appointments')
@Index('UQ_appointments_exam_schedule_active', ['examId', 'scheduledAt'], {
  unique: true,
  where: `"status" IN ('PENDING', 'SCHEDULED')`,
})
export class AppointmentEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    enumName: 'appointment_status_enum',
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({
    name: 'change_status',
    type: 'enum',
    enum: AppointmentChangeStatus,
    enumName: 'appointment_change_status_enum',
    default: AppointmentChangeStatus.NONE,
  })
  changeStatus: AppointmentChangeStatus;

  @Column({ name: 'requested_exam_id', type: 'uuid', nullable: true })
  requestedExamId?: string | null;

  @Column({ name: 'requested_scheduled_at', type: 'timestamptz', nullable: true })
  requestedScheduledAt?: Date | null;

  @Column({ name: 'requested_notes', type: 'text', nullable: true })
  requestedNotes?: string | null;

  @Column({ name: 'reviewed_by_user_id', type: 'uuid', nullable: true })
  reviewedByUserId?: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ExamEntity, (exam) => exam.appointments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'exam_id' })
  exam: ExamEntity;

  @ManyToOne(() => ExamEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'requested_exam_id' })
  requestedExam?: ExamEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedByUser?: UserEntity | null;
}
