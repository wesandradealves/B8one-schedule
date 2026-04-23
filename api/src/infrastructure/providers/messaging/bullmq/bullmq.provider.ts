import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullMqProvider implements IMessagingProvider {
  private readonly logger = new Logger(BullMqProvider.name);

  constructor(@InjectQueue('default') private readonly queue: Queue) {}

  async publish<T>(queueName: string, payload: T): Promise<void> {
    try {
      await this.queue.add(queueName, payload as object);
    } catch (error) {
      this.logger.warn(`Failed to enqueue message "${queueName}"`);
      this.logger.debug(String(error));
    }
  }
}
