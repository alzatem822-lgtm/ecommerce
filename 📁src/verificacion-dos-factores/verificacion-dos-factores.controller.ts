import { 
  Controller, 
  Post, 
  Body,
  UnauthorizedException, 
  UseGuards,
  Req
} from '@nestjs/common';
import { VerificacionDosFactoresService } from './verificacion-dos-factores.service';
import { VerificarCodigoDto } from './dto/verificar-codigo.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { VerificacionTokenGuard } from '../autenticacion/guardias/verificacion-token.guard'; // ← NUEVO IMPORT

@Controller('verificacion-dos-factores')
export class VerificacionDosFactoresController {
  
  constructor(
    private readonly verificacionDosFactoresService: VerificacionDosFactoresService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('verificar')
  @UseGuards(VerificacionTokenGuard) // ← NUEVO GUARD
  async verificarCodigo(
    @Body() verificarCodigoDto: VerificarCodigoDto,
    @Req() request: any // ← Obtener usuario del token especial
  ) {
    const usuarioId = request.user.sub; // ← Del token especial de verificación

    const esCodigoValido = await this.verificacionDosFactoresService.verificarCodigo(
      verificarCodigoDto.email,
      verificarCodigoDto.codigo,
    );

    if (!esCodigoValido) {
      throw new UnauthorizedException('Código de verificación inválido o expirado');
    }

    // Usar el usuarioId del token en lugar de buscar por email
    await this.usuariosService.marcarComoVerificado(usuarioId);
    
    const usuarioActualizado = await this.usuariosService.encontrarPorId(usuarioId);

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