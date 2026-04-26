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

  @Column({
    name: 'available_weekdays',
    type: 'jsonb',
    default: () => "'[1,2,3,4,5]'::jsonb",
  })
  availableWeekdays: number[];

  @Column({ name: 'available_start_time', type: 'varchar', length: 5, default: '07:00' })
  availableStartTime: string;

  @Column({ name: 'available_end_time', type: 'varchar', length: 5, default: '19:00' })
  availableEndTime: string;

  @Column({ name: 'available_from_date', type: 'date', nullable: true })
  availableFromDate?: string | null;

  @Column({ name: 'available_to_date', type: 'date', nullable: true })
  availableToDate?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.exam)
  appointments: AppointmentEntity[];
}
