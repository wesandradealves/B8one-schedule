import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { BaseEntity } from '@/domain/entities/commons/base.entity';
import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm';

@Entity('exams')
export class ExamEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.exam)
  appointments: AppointmentEntity[];
}
