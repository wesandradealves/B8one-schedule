import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullMqProvider implements IMessagingProvider {
  constructor(@InjectQueue('default') private readonly queue: Queue) {}

  async publish<T>(queueName: string, payload: T): Promise<void> {
    await this.queue.add(queueName, payload as object);
  }
}
