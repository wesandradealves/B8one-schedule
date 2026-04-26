import { BaseEntity } from '@/domain/entities/commons/base.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('auth_email_confirmation_tokens')
export class AuthEmailConfirmationEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index('UQ_auth_email_confirmation_tokens_token_hash', { unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 128 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt?: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.emailConfirmationTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}

