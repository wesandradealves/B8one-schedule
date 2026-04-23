import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GetAppointmentByIdUseCase } from '@/modules/appointments/use-cases/get-appointment-by-id.use-case';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
} from '../../../helpers/factories';

type Sut = {
  useCase: GetAppointmentByIdUseCase;
  appointmentRepository: jest.Mocked<IAppointmentRepository>;
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

  return {
    useCase: new GetAppointmentByIdUseCase(appointmentRepository),
    appointmentRepository,
  };
}

describe('GetAppointmentByIdUseCase', () => {
  it('throws NotFoundException when appointment does not exist', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing-id', user: makeAuthenticatedUser() }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('throws ForbiddenException when client requests appointment of another user', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' }),
    );

    await expect(
      useCase.execute({
        id: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'other-id', profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(new ForbiddenException('You can only access your own appointments'));
  });

  it('returns appointment when requester is admin', async () => {
    const { useCase, appointmentRepository } = createSut();
    const appointment = makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' });
    appointmentRepository.findById.mockResolvedValue(appointment);

    await expect(
      useCase.execute({
        id: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).resolves.toBe(appointment);
  });
});
