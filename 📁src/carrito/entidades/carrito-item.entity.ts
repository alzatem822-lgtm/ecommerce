import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Carrito } from './carrito.entity';
import { Producto } from '../../productos/entidades/producto.entity';

@Entity('carrito_items')
export class CarritoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Carrito, carrito => carrito.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carritoId' })
  carrito: Carrito;

  @Column()
  carritoId: string;

  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column()
  productoId: string;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaAgregado: Date;
}