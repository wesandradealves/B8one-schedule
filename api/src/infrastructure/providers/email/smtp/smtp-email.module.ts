import { IEmailProvider } from '@/domain/interfaces/providers/email.provider';
import { Module } from '@nestjs/common';
import { SmtpEmailProvider } from './smtp-email.provider';

@Module({
  providers: [
    {
      provide: IEmailProvider,
      useClass: SmtpEmailProvider,
    },
  ],
  exports: [IEmailProvider],
})
export class SmtpEmailModule {}
