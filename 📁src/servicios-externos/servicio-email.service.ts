// En: src/servicios-externos/servicio-email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class ServicioEmailService {
  private readonly logger = new Logger(ServicioEmailService.name);
  private readonly sendgridApiKey: string;
  private readonly sendgridFromEmail: string;

  constructor(private readonly configService: ConfigService) {
    // 1. Configura el cliente de SendGrid
    this.sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.sendgridFromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    
    if (!this.sendgridApiKey || !this.sendgridFromEmail) {
      this.logger.error('SENDGRID_API_KEY o SENDGRID_FROM_EMAIL no están configurados en .env');
    } else {
      SendGrid.setApiKey(this.sendgridApiKey);
      this.logger.log('Servicio de Email (SendGrid) configurado.');
    }
  }

  /**
   * Envía un correo electrónico con el código de verificación.
   * @param emailDestino El email del usuario.
   * @param codigo El código 2FA generado.
   */
  async enviarEmailVerificacion(emailDestino: string, codigo: string): Promise<void> {
    const msg = {
      to: emailDestino,
      from: this.sendgridFromEmail, // El email que verificaste en SendGrid
      subject: 'Tu Código de Verificación',
      
      // Puedes usar texto plano
      // text: `Tu código de verificación es: ${codigo}`,
      
      // O (recomendado) usar HTML simple
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          <p>Hola,</p>
          <p>Tu código de verificación de dos factores es:</p>
          <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${codigo}
          </p>
          <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
        </div>
      `,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Email de verificación enviado a ${emailDestino}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${emailDestino}`, error.response?.body || error.message);
      // Puedes lanzar una excepción si prefieres que el flujo se detenga
      // throw new InternalServerErrorException('Error al enviar el email');
    }
  }
}