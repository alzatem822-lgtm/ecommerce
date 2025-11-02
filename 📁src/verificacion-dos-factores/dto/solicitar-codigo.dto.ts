import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SolicitarCodigoDto {
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  telefono: string;
}