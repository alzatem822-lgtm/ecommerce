import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServicioSmsService {
  private readonly logger = new Logger(ServicioSmsService.name);

  constructor(private configService: ConfigService) {}

  async enviarSms(numero: string, mensaje: string): Promise<void> {
    // En desarrollo, simular el envío de SMS
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`[SIMULACIÓN SMS] Para: ${numero}, Mensaje: ${mensaje}`);
      return;
    }

    // En producción, integrar con servicio real como Twilio
    try {
      // const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      // const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
      // const client = require('twilio')(accountSid, authToken);
      
      // await client.messages.create({
      //   body: mensaje,
      //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
      //   to: numero,
      // });
      
      this.logger.log(`SMS enviado a ${numero}`);
    } catch (error) {
      this.logger.error(`Error enviando SMS: ${error.message}`);
      throw error;
    }
  }
}