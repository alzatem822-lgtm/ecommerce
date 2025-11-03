import { IsUUID, IsInt, Min, IsPositive } from 'class-validator';

export class AgregarAlCarritoDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @Min(1)
  @IsPositive()
  cantidad: number;
}