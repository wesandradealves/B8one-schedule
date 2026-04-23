import { BaseEntity } from '@/domain/entities/commons/base.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('auth_two_factor_codes')
export class AuthTwoFactorEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({
    type: 'enum',
    enum: AuthTwoFactorPurpose,
    enumName: 'auth_two_factor_purpose_enum',
    default: AuthTwoFactorPurpose.LOGIN,
  })
  purpose: AuthTwoFactorPurpose;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt?: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.twoFactorCodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
