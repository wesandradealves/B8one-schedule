import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import type { AppointmentEntity } from '@/domain/entities/appointment.entity';
import type { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
import type { ExamEntity } from '@/domain/entities/exam.entity';
import type { UserEntity } from '@/domain/entities/user.entity';
import type { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export function makeAuthenticatedUser(
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  return {
    id: overrides.id ?? 'user-id-1',
    email: overrides.email ?? 'user@b8one.com',
    profile: overrides.profile ?? UserProfile.ADMIN,
  };
}

export function makeUserEntity(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: overrides.id ?? 'user-id-1',
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
    fullName: overrides.fullName ?? 'User Name',
    email: overrides.email ?? 'user@b8one.com',
    passwordHash: overrides.passwordHash ?? 'hash',
    profile: overrides.profile ?? UserProfile.CLIENT,
    isActive: overrides.isActive ?? true,
    twoFactorCodes: overrides.twoFactorCodes ?? [],
    appointments: overrides.appointments ?? [],
  } as UserEntity;
}

export function makeExamEntity(overrides: Partial<ExamEntity> = {}): ExamEntity {
  return {
    id: overrides.id ?? 'exam-id-1',
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
    name: overrides.name ?? 'Exam Name',
    description: overrides.description ?? 'Exam Description',
    durationMinutes: overrides.durationMinutes ?? 30,
    priceCents: overrides.priceCents ?? 10000,
    isActive: overrides.isActive ?? true,
    appointments: overrides.appointments ?? [],
  } as ExamEntity;
}

export function makeAppointmentEntity(
  overrides: Partial<AppointmentEntity> = {},
): AppointmentEntity {
  const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    id: overrides.id ?? 'appointment-id-1',
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
    userId: overrides.userId ?? 'user-id-1',
    examId: overrides.examId ?? 'exam-id-1',
    scheduledAt: overrides.scheduledAt ?? scheduledAt,
    status: overrides.status ?? AppointmentStatus.SCHEDULED,
    notes: overrides.notes ?? null,
    changeStatus: overrides.changeStatus ?? AppointmentChangeStatus.NONE,
    requestedExamId: overrides.requestedExamId ?? null,
    requestedScheduledAt: overrides.requestedScheduledAt ?? null,
    requestedNotes: overrides.requestedNotes ?? null,
    reviewedByUserId: overrides.reviewedByUserId ?? null,
    reviewedAt: overrides.reviewedAt ?? null,
    user: overrides.user,
    exam: overrides.exam,
    requestedExam: overrides.requestedExam,
    reviewedByUser: overrides.reviewedByUser,
  } as AppointmentEntity;
}

export function makeAuthTwoFactorEntity(
  overrides: Partial<AuthTwoFactorEntity> = {},
): AuthTwoFactorEntity {
  return {
    id: overrides.id ?? '2fa-id-1',
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
    userId: overrides.userId ?? 'user-id-1',
    code: overrides.code ?? '123456',
    purpose: overrides.purpose ?? AuthTwoFactorPurpose.LOGIN,
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 10 * 60 * 1000),
    usedAt: overrides.usedAt ?? null,
    user: overrides.user,
  } as AuthTwoFactorEntity;
}
