import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfiguracionService } from './configuracion.service';

@Module({
  imports: [ConfigModule],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}