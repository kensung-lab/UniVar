import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private lastSendTime: number = new Date().getTime();

  constructor(private readonly mailerService: MailerService) {}

  async sendErrorEmail(errorMessage: string): Promise<boolean> {
    if (
      this.lastSendTime + +process.env.ERROR_EMAIL_INTERVAL >
      new Date().getTime()
    ) {
      await this.mailerService.sendMail({
        to: process.env.ERROR_RECIPIENT.split(','),
        subject: '[Bioinformatics Analysis Browser] Program Error',
        html:
          'Dear support,<br> \
          We have found the below error, please check. Thank you.<br><br> \
          Error: <br>' +
          errorMessage +
          '<br><br> \
          Best Regards,<br> \
          Application Support',
      });
    }

    return true;
  }
}
