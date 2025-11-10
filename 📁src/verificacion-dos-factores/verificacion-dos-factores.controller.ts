import { 
  Controller, 
  Post, 
  Body,
  UnauthorizedException, 
} from '@nestjs/common';
import { VerificacionDosFactoresService } from './verificacion-dos-factores.service';
import { VerificarCodigoDto } from './dto/verificar-codigo.dto';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('verificacion-dos-factores')
export class VerificacionDosFactoresController {
  
  constructor(
    private readonly verificacionDosFactoresService: VerificacionDosFactoresService,
    private readonly usuariosService: UsuariosService,
  ) {}

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
    
    await this.usuariosService.marcarComoVerificado(usuario.id);
    
    const usuarioActualizado = await this.usuariosService.encontrarPorId(usuario.id);

    return {
      mensaje: 'Cuenta verificada exitosamente. Ahora puedes iniciar sesión.',
      verificado: true,
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