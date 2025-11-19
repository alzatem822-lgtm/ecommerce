import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CodigoVerificacion } from '../../verificacion-dos-factores/entidades/codigo-verificacion.entity';
import { Exclude } from 'class-transformer'; // ✅ AÑADIR IMPORT

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  @Exclude() // ✅ OCULTAR TELÉFONO
  telefono: string;

  @Column()
  @Exclude() // ✅ OCULTAR CONTRASEÑA
  password: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ default: false })
  @Exclude() // ✅ OCULTAR ESTADO VERIFICACIÓN
  verificado: boolean;

  @Column({ default: 'user' })
  rol: string;

  @Column({ type: 'boolean', default: false })
  @Exclude() // ✅ OCULTAR ESTADO VERIFICACIÓN (duplicado)
  estaVerificado: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  // Relación con códigos de verificación
  @OneToMany(() => CodigoVerificacion, codigo => codigo.usuario, { onDelete: 'CASCADE' })
  codigosVerificacion: CodigoVerificacion[];
}