// En: src/verificacion-dos-factores/verificacion-dos-factores.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  UnauthorizedException, 
} from '@nestjs/common';
import { VerificacionDosFactoresService } from './verificacion-dos-factores.service';
import { VerificarCodigoDto } from './dto/verificar-codigo.dto';
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';
import { ObtenerUsuario } from '../autenticacion/decoradores/obtener-usuario.decorador';
import { Usuario } from '../usuarios/entidades/usuario.entity'; 
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt'; // ← AÑADIR

@Controller('verificacion-dos-factores')
export class VerificacionDosFactoresController {
  
  constructor(
    private readonly verificacionDosFactoresService: VerificacionDosFactoresService,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService, // ← AÑADIR
  ) {}

  @Post('solicitar-codigo')
  @UseGuards(JwtGuardia) 
  async solicitarCodigo(@ObtenerUsuario() usuario: Usuario) {
    return this.verificacionDosFactoresService.enviarCodigoVerificacion(
      usuario.id,
      usuario.email,
    );
  }

  @Post('verificar')
  async verificarCodigo(@Body() verificarCodigoDto: VerificarCodigoDto) {
    const esCodigoValido = await this.verificacionDosFactoresService.verificarCodigo(
      verificarCodigoDto.email,
      verificarCodigoDto.codigo,
    );

    if (!esCodigoValido) {
      throw new UnauthorizedException('Código de verificación inválido o expirado');
    }

    const usuario = await this.usuariosService.encontrarPorEmail(verificarCodigoDto.email);
    
    // ✅ CORRECCIÓN: Marcar como verificado y generar token directamente
    // EVITA la verificación duplicada en AutenticacionService.verificarCodigo2FA
    await this.usuariosService.marcarComoVerificado(usuario.id);
    
    const usuarioActualizado = await this.usuariosService.encontrarPorId(usuario.id);

    const payload = { 
      email: usuarioActualizado.email, 
      sub: usuarioActualizado.id, 
      rol: usuarioActualizado.rol 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuarioActualizado.id,
        email: usuarioActualizado.email,
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        rol: usuarioActualizado.rol,
      },
    };
  }
}