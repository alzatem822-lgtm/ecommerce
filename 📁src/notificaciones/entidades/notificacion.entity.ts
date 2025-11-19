import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  Index 
} from 'typeorm';

export enum TipoNotificacion {
  CONFIRMACION_COMPRA = 'confirmacion_compra',
  CAMBIO_ESTADO_ORDEN = 'cambio_estado_orden',
  STOCK_BAJO = 'stock_bajo',
  BIENVENIDA = 'bienvenida',
  CODIGO_VERIFICACION = 'codigo_verificacion'
}

export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  ENVIADA = 'enviada',
  FALLIDA = 'fallida'
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TipoNotificacion
  })
  tipo: TipoNotificacion;

  @Column({
    type: 'enum',
    enum: EstadoNotificacion,
    default: EstadoNotificacion.PENDIENTE
  })
  estado: EstadoNotificacion;

  @Column()
  destinatario: string; // email del usuario/admin

  @Column('text')
  asunto: string;

  @Column('text')
  contenido: string;

  @Column({ nullable: true })
  @Index()
  usuarioId: string; // ID del usuario relacionado

  @Column({ nullable: true })
  @Index()
  ordenId: string; // ID de la orden relacionada

  @Column({ nullable: true })
  @Index()
  productoId: string; // ID del producto relacionado

  @Column('jsonb', { nullable: true })
  metadata: any; // Datos adicionales de la notificación

  @Column({ nullable: true })
  error: string; // Mensaje de error si falla

  @Column({ default: 0 })
  intentos: number; // Número de intentos de envío

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ nullable: true })
  fechaEnvio: Date; // Cuando se envió realmente
}