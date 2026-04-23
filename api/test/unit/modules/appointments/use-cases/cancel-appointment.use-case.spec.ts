import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CancelAppointmentUseCase } from '@/modules/appointments/use-cases/cancel-appointment.use-case';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
} from '../../../helpers/factories';

type Sut = {
  useCase: CancelAppointmentUseCase;
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
    useCase: new CancelAppointmentUseCase(appointmentRepository, messagingProvider),
    appointmentRepository,
    messagingProvider,
  };
}

describe('CancelAppointmentUseCase', () => {
  it('throws NotFoundException when appointment does not exist', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'missing-id',
        user: makeAuthenticatedUser(),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('throws ForbiddenException when client tries to cancel appointment of another user', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ userId: 'owner-id' }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'other-id', profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(new ForbiddenException('You can only cancel your own appointments'));
  });

  it('throws NotFoundException when cancel operation returns null', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' }),
    );
    appointmentRepository.cancelAppointment.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'owner-id', profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('cancels appointment and publishes event', async () => {
    const { useCase, appointmentRepository, messagingProvider } = createSut();

    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' }),
    );
    appointmentRepository.cancelAppointment.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' }),
    );

    const output = await useCase.execute({
      appointmentId: 'appointment-id-1',
      user: makeAuthenticatedUser({ id: 'owner-id', profile: UserProfile.CLIENT }),
    });

    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.cancelled', {
      appointmentId: 'appointment-id-1',
      userId: 'owner-id',
      cancelledByUserId: 'owner-id',
    });
    expect(output.id).toBe('appointment-id-1');
  });
});
