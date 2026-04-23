import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('default')
export class BullMqProcessor extends WorkerHost {
  private readonly logger = new Logger(BullMqProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.debug(`Processed message "${job.name}"`);
  }
}
