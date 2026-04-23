import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DeleteAppointmentUseCase } from '@/modules/appointments/use-cases/delete-appointment.use-case';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
} from '../../../helpers/factories';

type Sut = {
  useCase: DeleteAppointmentUseCase;
  appointmentRepository: jest.Mocked<IAppointmentRepository>;
  messagingProvider: jest.Mocked<IMessagingProvider>;
};

function createSut(): Sut {
  const appointmentRepository: jest.Mocked<IAppointmentRepository> = {
    findById: jest.fn(),
    findByIdAndUserId: jest.fn(),
    findExamScheduleConflict: jest.fn(),
    createAppointment: jest.fn(),
    updateAppointment: jest.fn(),
    cancelAppointment: jest.fn(),
    requestAppointmentChange: jest.fn(),
    approveAppointmentChange: jest.fn(),
    deleteAppointment: jest.fn(),
    listByUserId: jest.fn(),
    listAll: jest.fn(),
    clearChangeRequest: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  return {
    useCase: new DeleteAppointmentUseCase(appointmentRepository, messagingProvider),
    appointmentRepository,
    messagingProvider,
  };
}

describe('DeleteAppointmentUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, appointmentRepository } = createSut();

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(new ForbiddenException('Only admin users can delete appointments'));

    expect(appointmentRepository.findById).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'missing-id',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('throws NotFoundException when delete operation does not affect rows', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(makeAppointmentEntity({ id: 'appointment-id-1' }));
    appointmentRepository.deleteAppointment.mockResolvedValue(false);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('deletes appointment and publishes event', async () => {
    const { useCase, appointmentRepository, messagingProvider } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'user-id-1' }),
    );
    appointmentRepository.deleteAppointment.mockResolvedValue(true);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
      }),
    ).resolves.toBeUndefined();

    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.deleted', {
      appointmentId: 'appointment-id-1',
      userId: 'user-id-1',
      deletedByUserId: 'admin-id',
    });
  });
});
