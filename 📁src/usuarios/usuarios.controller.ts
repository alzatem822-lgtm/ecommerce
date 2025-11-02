import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';
import { RolesGuardia } from '../autenticacion/guardias/roles.guardia';
import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtService } from '@nestjs/jwt'; // ← AÑADIR

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService, // ← AÑADIR
  ) {}

  @Post('registro')
  async registrar(@Body() crearUsuarioDto: CrearUsuarioDto) {
    const usuario = await this.usuariosService.crear(crearUsuarioDto);
    
    // ✅ GENERAR token_2FA para que el usuario pueda verificar inmediatamente
    const payload2FA = { 
      email: usuario.email, 
      sub: usuario.id, 
      rol: usuario.rol,
      esToken2FA: true 
    };

    const token_2FA = this.jwtService.sign(payload2FA, { expiresIn: '10m' });

    return {
      mensaje: 'Usuario registrado. Se ha enviado un código de verificación a tu email',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
      },
      token_2FA: token_2FA, // ← ESTO ES LO NUEVO
      requiereVerificacion: true,
    };
  }

  @Get()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async obtenerTodos() {
    return this.usuariosService.obtenerTodos();
  }
}