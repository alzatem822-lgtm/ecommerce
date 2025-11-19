import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, TipoNotificacion, EstadoNotificacion } from '../entidades/notificacion.entity';
import { PlantillasService } from './plantillas.service';
import { ServicioEmailService } from '../../servicios-externos/servicio-email.service';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
    private plantillasService: PlantillasService,
    private servicioEmailService: ServicioEmailService,
  ) {}

  /**
   * Envía una notificación y guarda el historial
   */
  async enviarNotificacion(
    tipo: TipoNotificacion,
    destinatario: string,
    datos: any,
    usuarioId?: string,
    ordenId?: string,
    productoId?: string,
  ): Promise<boolean> {
    let notificacionGuardada;

    try {
      // ✅ 1. PRIMERO preparar plantilla (ANTES de guardar en BD)
      const { asunto, contenido } = await this.plantillasService.prepararPlantilla(tipo, datos);

      // ✅ 2. LUEGO crear registro en BD CON asunto y contenido
      const notificacion = this.notificacionRepository.create({
        tipo,
        destinatario,
        usuarioId,
        ordenId,
        productoId,
        metadata: datos,
        estado: EstadoNotificacion.PENDIENTE,
        asunto, // ✅ YA TENEMOS EL ASUNTO
        contenido, // ✅ YA TENEMOS EL CONTENIDO
      });

      notificacionGuardada = await this.notificacionRepository.save(notificacion);

      // ✅ 3. ENVIAR email - ✅ CORREGIDO: USAR MÉTODO GENÉRICO
      await this.servicioEmailService.enviarEmailGenerico(
        destinatario,
        asunto,
        contenido
      );

      // ✅ 4. Actualizar estado a enviada
      await this.notificacionRepository.update(notificacionGuardada.id, {
        estado: EstadoNotificacion.ENVIADA,
        fechaEnvio: new Date(),
      });
      
      this.logger.log(`✅ Notificación ${tipo} enviada a ${destinatario}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Error enviando notificación ${tipo}:`, error);
      
      // Guardar error en BD si existe el registro
      if (notificacionGuardada) {
        await this.notificacionRepository.update(notificacionGuardada.id, {
          estado: EstadoNotificacion.FALLIDA,
          intentos: notificacionGuardada.intentos + 1,
          error: error.message,
        });
      }
      
      return false;
    }
  }

  /**
   * Notificación específica: Confirmación de compra
   */
  async enviarConfirmacionCompra(usuarioId: string, ordenId: string, datosOrden: any): Promise<boolean> {
    return this.enviarNotificacion(
      TipoNotificacion.CONFIRMACION_COMPRA,
      datosOrden.usuarioEmail,
      datosOrden,
      usuarioId,
      ordenId,
    );
  }

  /**
   * Notificación específica: Cambio de estado de orden
   */
  async enviarCambioEstadoOrden(usuarioId: string, ordenId: string, datos: any): Promise<boolean> {
    return this.enviarNotificacion(
      TipoNotificacion.CAMBIO_ESTADO_ORDEN,
      datos.destinatario,
      datos,
      usuarioId,
      ordenId,
    );
  }

  /**
   * Notificación específica: Stock bajo
   */
  async enviarAlertaStockBajo(productoId: string, datosProducto: any, adminEmail: string): Promise<boolean> {
    return this.enviarNotificacion(
      TipoNotificacion.STOCK_BAJO,
      adminEmail,
      datosProducto,
      undefined, // No hay usuario específico
      undefined, // No hay orden
      productoId,
    );
  }

  /**
   * Obtener historial de notificaciones de un usuario
   */
  async obtenerHistorialUsuario(usuarioId: string): Promise<Notificacion[]> {
    return this.notificacionRepository.find({
      where: { usuarioId },
      order: { fechaCreacion: 'DESC', },
      take: 50, // Últimas 50 notificaciones
    });
  }
}