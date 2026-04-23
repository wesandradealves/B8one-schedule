import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
import { BaseEntity } from '@/domain/entities/commons/base.entity';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  Column,
  Entity,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Index('UQ_users_email', { unique: true })
  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserProfile,
    enumName: 'user_profile_enum',
    default: UserProfile.CLIENT,
  })
  profile: UserProfile;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => AuthTwoFactorEntity, (twoFactor) => twoFactor.user)
  twoFactorCodes: AuthTwoFactorEntity[];

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.user)
  appointments: AppointmentEntity[];
}
