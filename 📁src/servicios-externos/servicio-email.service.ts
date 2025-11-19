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
      from: this.sendgridFromEmail,
      subject: 'Tu Código de Verificación',
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
    }
  }

  /**
   * ✅ MÉTODO NUEVO: Envía un correo electrónico genérico para notificaciones
   * @param emailDestino El email del destinatario
   * @param asunto El asunto del email
   * @param contenidoHtml El contenido HTML del email
   */
  async enviarEmailGenerico(emailDestino: string, asunto: string, contenidoHtml: string): Promise<void> {
    const msg = {
      to: emailDestino,
      from: this.sendgridFromEmail,
      subject: asunto,
      html: contenidoHtml,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`📧 Email genérico enviado a ${emailDestino}: ${asunto}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar email a ${emailDestino}`, error.response?.body || error.message);
      throw error; // Relanzamos el error para manejarlo en el servicio de notificaciones
    }
  }
}