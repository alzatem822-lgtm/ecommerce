import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { LoginUsuarioDto } from '../usuarios/dto/login-usuario.dto';
import { LoginAdministradorDto } from '../administradores/dto/login-administrador.dto';
import { LocalGuardia } from './guardias/autenticacion.guardia';
import { JwtGuardia } from './guardias/jwt.guardia';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('login/usuario')
  @UseGuards(LocalGuardia)
  async loginUsuario(@Request() req) {
    return this.autenticacionService.loginUsuario(req.user);
  }

  @Post('login/administrador')
  @UseGuards(LocalGuardia)
  async loginAdministrador(@Request() req) {
    return this.autenticacionService.loginAdministrador(req.user);
  }

  @Get('perfil')
  @UseGuards(JwtGuardia)
  obtenerPerfil(@Request() req) {
    return req.user;
  }
}