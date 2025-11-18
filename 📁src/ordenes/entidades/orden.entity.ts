import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type EstadoOrden = 'pendiente' | 'confirmada' | 'enviada' | 'entregada' | 'cancelada';

@Entity('ordenes')
export class Orden {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Usuario')
  @JoinColumn({ name: 'usuarioId' })
  usuario: any;

  @Column()
  usuarioId: string;

  // SOLUCIÓN: Relación sin función flecha
  @OneToMany('OrdenItem', 'orden', { cascade: true })
  items: any[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'],
    default: 'pendiente'
  })
  estado: EstadoOrden;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column()
  codigoPostal: string;

  @Column()
  telefonoContacto: string;

  @Column({ unique: true })
  numeroOrden: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}