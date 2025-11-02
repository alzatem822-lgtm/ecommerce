import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'; // Importar JoinColumn
import { Usuario } from '../../usuarios/entidades/usuario.entity';

@Entity('codigos_verificacion')
export class CodigoVerificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' }) // Aseguramos el tipo UUID si es posible
  usuarioId: string;

  @Column({ length: 6 }) // Agregado tipo, asumo que es string de 6
  codigo: string;

  @Column()
  expiracion: Date;

  @Column({ default: false })
  utilizado: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  // --- COMIENZO DE LA CORRECCIÓN ---
  @ManyToOne(() => Usuario, usuario => usuario.codigosVerificacion, {
    // 1. Añadimos la regla de eliminación en cascada
    onDelete: 'CASCADE',
    // 2. Cargamos el usuario cada vez que cargamos el código (opcional, pero útil)
    lazy: false, 
  })
  // 3. Especificamos explícitamente la columna de clave foránea
  @JoinColumn({ name: 'usuarioId' }) 
  usuario: Usuario;
  // --- FIN DE LA CORRECCIÓN ---
}
