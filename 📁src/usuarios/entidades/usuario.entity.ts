import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'; // Importar OneToMany

// Asegúrate de que esta ruta de importación sea correcta
import { CodigoVerificacion } from '../../verificacion-dos-factores/entidades/codigo-verificacion.entity'; 

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  telefono: string;

  @Column()
  password: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ default: false })
  verificado: boolean;

  @Column({ default: 'user' })
  rol: string;

  @Column({ type: 'boolean', default: false })
  estaVerificado: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  // --- COMIENZO DE LA CORRECCIÓN ---

  // 1. Definimos la relación de uno-a-muchos (Un Usuario tiene muchos Códigos)
  @OneToMany(
    () => CodigoVerificacion,
    (codigo) => codigo.usuario,
    // 2. Aplicamos la regla para eliminar los códigos asociados
    { onDelete: 'CASCADE' }
  )
  codigosVerificacion: CodigoVerificacion[];

  // --- FIN DE LA CORRECCIÓN ---
}
