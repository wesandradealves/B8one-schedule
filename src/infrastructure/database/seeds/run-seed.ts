import dataSource from '@/infrastructure/database/config/typeorm.data-source';
import { ExamEntity } from '@/domain/entities/exam.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import * as bcrypt from 'bcrypt';

const examsSeedData: Array<Partial<ExamEntity>> = [
  { name: 'Hemograma Completo', description: 'Análise geral do sangue', durationMinutes: 20, priceCents: 4500, isActive: true },
  { name: 'Glicemia em Jejum', description: 'Medição de glicose em jejum', durationMinutes: 15, priceCents: 3000, isActive: true },
  { name: 'Colesterol Total e Frações', description: 'Perfil lipídico completo', durationMinutes: 20, priceCents: 5200, isActive: true },
  { name: 'TSH', description: 'Hormônio estimulante da tireoide', durationMinutes: 15, priceCents: 4100, isActive: true },
  { name: 'T4 Livre', description: 'Dosagem de tiroxina livre', durationMinutes: 15, priceCents: 4300, isActive: true },
  { name: 'Vitamina D', description: '25-hidroxivitamina D', durationMinutes: 20, priceCents: 7900, isActive: true },
  { name: 'Creatinina', description: 'Avaliação da função renal', durationMinutes: 15, priceCents: 2800, isActive: true },
  { name: 'Ureia', description: 'Avaliação da função renal', durationMinutes: 15, priceCents: 2600, isActive: true },
  { name: 'Ferritina', description: 'Reserva de ferro no organismo', durationMinutes: 20, priceCents: 5800, isActive: true },
  { name: 'PCR Ultra Sensível', description: 'Proteína C reativa ultra sensível', durationMinutes: 20, priceCents: 6000, isActive: true },
];

const usersSeedData = async (): Promise<Array<Partial<UserEntity>>> => {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const clientPasswordHash = await bcrypt.hash('Client@123', 10);

  return [
    {
      fullName: 'Administrador B8one',
      email: 'admin@b8one.com',
      passwordHash: adminPasswordHash,
      profile: UserProfile.ADMIN,
      isActive: true,
    },
    {
      fullName: 'Cliente B8one',
      email: 'cliente@b8one.com',
      passwordHash: clientPasswordHash,
      profile: UserProfile.CLIENT,
      isActive: true,
    },
  ];
};

async function runSeed(): Promise<void> {
  await dataSource.initialize();

  const examRepository = dataSource.getRepository(ExamEntity);
  const userRepository = dataSource.getRepository(UserEntity);

  const existingExamsCount = await examRepository
    .createQueryBuilder('exam')
    .getCount();

  if (existingExamsCount === 0) {
    await examRepository
      .createQueryBuilder()
      .insert()
      .into(ExamEntity)
      .values(examsSeedData)
      .execute();
  }

  const users = await usersSeedData();
  for (const user of users) {
    const exists = await userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: user.email })
      .getOne();

    if (!exists) {
      await userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values(user)
        .execute();
    }
  }

  await dataSource.destroy();
}

runSeed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Seed executed successfully');
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  });
