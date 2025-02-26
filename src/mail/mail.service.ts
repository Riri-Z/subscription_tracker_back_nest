import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(email: string, url: string) {
    try {
      const message = {
        to: email,
        subject: 'Reset password',
        text: email + url,
        html: `
          <div>
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
            <p><a href="${url}">Réinitialiser mon mot de passe</a></p>
            <p>Ce lien expirera dans 20 minutes.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <p>Cordialement,
          </div>`,
      };

      const transporter = await this.mailerService.verifyAllTransporters();
      if (!transporter) {
        throw new Error('Transporter is misconfigured');
      }
      return await this.mailerService.sendMail(message);
    } catch (error) {
      console.error(error);
    }
  }
}
