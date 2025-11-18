import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('orden_items')
export class OrdenItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Orden', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordenId' })
  orden: any;

  @Column()
  ordenId: string;

  @ManyToOne('Producto')
  @JoinColumn({ name: 'productoId' })
  producto: any;

  @Column()
  productoId: string;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}