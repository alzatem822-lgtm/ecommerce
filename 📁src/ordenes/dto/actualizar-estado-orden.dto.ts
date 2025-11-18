import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoOrden } from '../entidades/orden.entity';

export class ActualizarEstadoOrdenDto {
  @IsNotEmpty()
  @IsEnum(['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'])
  estado: EstadoOrden;
}