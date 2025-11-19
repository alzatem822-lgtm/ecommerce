import { IsEnum, IsEmail, IsOptional, IsUUID } from 'class-validator';
import { TipoNotificacion } from '../entidades/notificacion.entity';

export class CrearNotificacionDto {
  @IsEnum(TipoNotificacion)
  tipo: TipoNotificacion;

  @IsEmail()
  destinatario: string;

  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsOptional()
  @IsUUID()
  ordenId?: string;

  @IsOptional()
  @IsUUID()
  productoId?: string;

  datos: any; // Datos dinámicos para la plantilla
}