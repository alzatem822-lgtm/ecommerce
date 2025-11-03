// actualizar-producto.dto.ts - VERIFICAR que tenga ESTE contenido exacto
import { IsString, IsNumber, IsPositive, IsOptional, MinLength, IsUrl, IsBoolean } from 'class-validator';

export class ActualizarProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  precio?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  stock?: number;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}