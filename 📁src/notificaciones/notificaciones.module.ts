import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entidades/notificacion.entity';
import { NotificacionesService } from './servicios/notificaciones.service';
import { PlantillasService } from './servicios/plantillas.service';
import { ServiciosExternosModule } from '../servicios-externos/servicios-externos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion]),
    ServiciosExternosModule, // Para usar SendGrid
  ],
  providers: [NotificacionesService, PlantillasService],
  exports: [NotificacionesService], // Para usar en otros módulos
})
export class NotificacionesModule {}