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
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';
import { RolesGuardia } from '../autenticacion/guardias/roles.guardia';
import { Roles } from '../autenticacion/decoradores/roles.decorador';
import { ObtenerUsuario } from '../autenticacion/decoradores/obtener-usuario.decorador';
import { Usuario } from './entidades/usuario.entity';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('registro')
  async registrar(@Body() crearUsuarioDto: CrearUsuarioDto) {
    const usuario = await this.usuariosService.crear(crearUsuarioDto);

    return {
      mensaje: 'Usuario registrado. Se ha enviado un código de verificación a tu email',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
      },
      requiereVerificacion: true,
    };
  }

  @Get('perfil')
  @UseGuards(JwtGuardia)
  async obtenerPerfil(@ObtenerUsuario() usuario: Usuario) {
    return usuario;
  }

  @Put('perfil')
  @UseGuards(JwtGuardia)
  async actualizarPerfil(
    @ObtenerUsuario() usuario: Usuario,
    @Body() actualizarPerfilDto: ActualizarPerfilDto
  ) {
    return this.usuariosService.actualizarPerfil(usuario.id, actualizarPerfilDto);
  }

  @Get()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async obtenerTodos() {
    return this.usuariosService.obtenerTodos();
  }

  @Get(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async obtenerUno(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.encontrarPorId(id);
  }

  @Put(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async actualizarUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto
  ) {
    return this.usuariosService.actualizarUsuario(id, actualizarUsuarioDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async eliminarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.eliminarUsuario(id);
  }
}