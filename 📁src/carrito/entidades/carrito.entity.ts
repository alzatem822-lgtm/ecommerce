import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Column, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entity';
import { CarritoItem } from './carrito-item.entity';

@Entity('carritos')
export class Carrito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, usuario => usuario.id)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  usuarioId: string;

  @OneToMany(() => CarritoItem, item => item.carrito, { cascade: true })
  items: CarritoItem[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  // Método para calcular el total
  calcularTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
}