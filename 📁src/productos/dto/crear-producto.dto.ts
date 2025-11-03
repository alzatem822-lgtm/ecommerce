// En: src/productos/dto/crear-producto.dto.ts
import { IsString, IsNumber, IsPositive, IsOptional, MinLength, IsUrl, IsBoolean } from 'class-validator';

export class CrearProductoDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  precio: number;

  @IsNumber()
  @IsPositive()
  stock: number;

  @IsString()
  categoria: string;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}