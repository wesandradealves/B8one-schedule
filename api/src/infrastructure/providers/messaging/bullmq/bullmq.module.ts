import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullMqProvider } from './bullmq.provider';
import { BullMqProcessor } from './bullmq.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password') || undefined,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'default' }),
  ],
  providers: [
    {
      provide: IMessagingProvider,
      useClass: BullMqProvider,
    },
    BullMqProcessor,
  ],
  exports: [IMessagingProvider],
})
export class BullMqMessagingModule {}
