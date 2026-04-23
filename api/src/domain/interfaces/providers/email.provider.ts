export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailProvider {
  send(data: SendEmailInput): Promise<void>;
}

export const IEmailProvider = Symbol('IEmailProvider');
