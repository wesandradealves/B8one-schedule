import { ListAppointmentsUseCase } from '@/modules/appointments/use-cases/list-appointments.use-case';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
} from '../../../helpers/factories';

type Sut = {
  useCase: ListAppointmentsUseCase;
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
    useCase: new ListAppointmentsUseCase(appointmentRepository),
    appointmentRepository,
  };
}

describe('ListAppointmentsUseCase', () => {
  it('returns listAll for admin', async () => {
    const { useCase, appointmentRepository } = createSut();
    const pagination = { page: 1, limit: 5 };

    appointmentRepository.listAll.mockResolvedValue({
      data: [makeAppointmentEntity({ id: 'a1' })],
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
    });

    const output = await useCase.execute(
      makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      pagination,
    );

    expect(appointmentRepository.listAll).toHaveBeenCalledWith(pagination);
    expect(appointmentRepository.listByUserId).not.toHaveBeenCalled();
    expect(output.total).toBe(1);
  });

  it('returns listByUserId for client', async () => {
    const { useCase, appointmentRepository } = createSut();
    const pagination = { page: 2, limit: 2 };

    appointmentRepository.listByUserId.mockResolvedValue({
      data: [makeAppointmentEntity({ id: 'a2', userId: 'client-id' })],
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });

    const output = await useCase.execute(
      makeAuthenticatedUser({ id: 'client-id', profile: UserProfile.CLIENT }),
      pagination,
    );

    expect(appointmentRepository.listByUserId).toHaveBeenCalledWith('client-id', pagination);
    expect(appointmentRepository.listAll).not.toHaveBeenCalled();
    expect(output.page).toBe(2);
  });
});
