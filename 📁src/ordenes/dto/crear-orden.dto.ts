import { IsNotEmpty, IsString } from 'class-validator';

export class CrearOrdenDto {
  @IsNotEmpty()
  @IsString()
  direccion: string;

  @IsNotEmpty()
  @IsString()
  ciudad: string;

  @IsNotEmpty()
  @IsString()
  codigoPostal: string;

  @IsNotEmpty()
  @IsString()
  telefonoContacto: string;

}