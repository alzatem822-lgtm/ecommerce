import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Exclude } from 'class-transformer'; // ✅ AÑADIR IMPORT

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ default: 0 })
  stock: number;

  @Column()
  categoria: string;

  @Column({ nullable: true })
  imagenUrl: string;

  @Column({ default: true })
  activo: boolean;

  // ✅ SOLUCIÓN: Usar string para evitar import circular
  @ManyToOne('Administrador', 'productos')
  @JoinColumn({ name: 'administradorId' })
  administrador: any;

  @Column()
  @Exclude() // ✅ OCULTAR ADMINISTRADOR ID
  administradorId: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}