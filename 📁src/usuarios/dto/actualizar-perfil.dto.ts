// En: src/usuarios/dto/actualizar-perfil.dto.ts
import { IsString, IsOptional, MinLength } from 'class-validator';

export class ActualizarPerfilDto {
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
}