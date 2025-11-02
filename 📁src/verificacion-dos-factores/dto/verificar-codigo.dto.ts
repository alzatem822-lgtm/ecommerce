// En: src/verificacion-dos-factores/dto/verificar-codigo.dto.ts

import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerificarCodigoDto {
  @IsNotEmpty({ message: 'El email es obligatorio.' })
  @IsEmail({}, { message: 'Formato de email inválido.' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  codigo: string;
}