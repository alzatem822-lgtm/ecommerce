import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServicioSmsService } from './servicio-sms.service';
import { ServicioEmailService } from './servicio-email.service';

@Module({
  imports: [ConfigModule],
  providers: [ServicioSmsService, ServicioEmailService],
  exports: [ServicioSmsService, ServicioEmailService],
})
export class ServiciosExternosModule {}