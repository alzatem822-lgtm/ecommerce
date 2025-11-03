import { IsInt, Min, IsPositive } from 'class-validator';

export class ActualizarCantidadDto {
  @IsInt()
  @Min(1)
  @IsPositive()
  cantidad: number;
}