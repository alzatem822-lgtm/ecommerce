import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Put, 
  Param, 
  Delete,
  ParseUUIDPipe 
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto'; // ← NUEVO
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto'; // ← NUEVO
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';
import { RolesGuardia } from '../autenticacion/guardias/roles.guardia';
import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { JwtService } from '@nestjs/jwt';
import { ObtenerUsuario } from '../autenticacion/decoradores/obtener-usuario.decorador'; // ← NUEVO
import { Usuario } from './entidades/usuario.entity'; // ← NUEVO

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('registro')
  async registrar(@Body() crearUsuarioDto: CrearUsuarioDto) {
    const usuario = await this.usuariosService.crear(crearUsuarioDto);
    
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
      token_2FA: token_2FA,
      requiereVerificacion: true,
    };
  }

  // ✅ NUEVO: Usuario ve su propio perfil
  @Get('perfil')
  @UseGuards(JwtGuardia)
  async obtenerPerfil(@ObtenerUsuario() usuario: Usuario) {
    return usuario;
  }

  // ✅ NUEVO: Usuario edita su propio perfil
  @Put('perfil')
  @UseGuards(JwtGuardia)
  async actualizarPerfil(
    @ObtenerUsuario() usuario: Usuario,
    @Body() actualizarPerfilDto: ActualizarPerfilDto
  ) {
    return this.usuariosService.actualizarPerfil(usuario.id, actualizarPerfilDto);
  }

  // ✅ YA EXISTÍA: Admin ve todos los usuarios
  @Get()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async obtenerTodos() {
    return this.usuariosService.obtenerTodos();
  }

  // ✅ NUEVO: Admin ve un usuario específico
  @Get(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async obtenerUno(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.encontrarPorId(id);
  }

  // ✅ NUEVO: Admin edita cualquier usuario
  @Put(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async actualizarUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto
  ) {
    return this.usuariosService.actualizarUsuario(id, actualizarUsuarioDto);
  }

  // ✅ NUEVO: Admin elimina usuario
  @Delete(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async eliminarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.eliminarUsuario(id);
  }
}