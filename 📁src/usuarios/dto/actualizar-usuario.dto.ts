// En: src/usuarios/dto/actualizar-usuario.dto.ts
import { IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsBoolean()
  verificado?: boolean;

  @IsOptional()
  @IsString()
  rol?: string;
}