import {
  IEmailProvider,
  SendEmailInput,
} from '@/domain/interfaces/providers/email.provider';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async send(data: SendEmailInput): Promise<void> {
    const host = this.configService.get<string>('email.smtp.host');
    const port = this.configService.get<number>('email.smtp.port');
    const user = this.configService.get<string>('email.smtp.user');
    const pass = this.configService.get<string>('email.smtp.pass');
    const from = this.configService.get<string>('email.smtp.from');

    if (!host) {
      this.logger.warn(
        `SMTP_HOST not configured; e-mail delivery skipped for recipient ${data.to}`,
      );
      this.logger.log(`2FA message preview: ${data.subject}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
