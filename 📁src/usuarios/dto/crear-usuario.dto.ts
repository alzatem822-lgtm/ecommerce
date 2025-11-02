import { IsEmail, IsString, IsPhoneNumber, MinLength, IsNotEmpty } from 'class-validator';

export class CrearUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;
}