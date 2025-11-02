import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AdministradoresService } from '../administradores/administradores.service';
import { VerificacionDosFactoresService } from '../verificacion-dos-factores/verificacion-dos-factores.service';
import { Usuario } from '../usuarios/entidades/usuario.entity';
import { Administrador } from '../administradores/entidades/administrador.entity';

@Injectable()
export class AutenticacionService {
  constructor(
    private jwtService: JwtService,
    private usuariosService: UsuariosService,
    private administradoresService: AdministradoresService,
    private verificacionDosFactoresService: VerificacionDosFactoresService,
  ) {}

  async validarUsuario(email: string, password: string): Promise<any> {
    try {
      const usuario = await this.usuariosService.encontrarPorEmail(email);
      const esPasswordValida = await this.usuariosService.validarPassword(usuario, password);
      
      if (esPasswordValida) {
        const { password, ...result } = usuario;
        return result;
      }
    } catch (error) {
      // Usuario no encontrado o password inválida
    }
    return null;
  }

  async validarAdministrador(email: string, password: string): Promise<any> {
    try {
      const administrador = await this.administradoresService.encontrarPorEmail(email);
      const esPasswordValida = await this.administradoresService.validarPassword(administrador, password);
      
      if (esPasswordValida) {
        const { password, ...result } = administrador;
        return result;
      }
    } catch (error) {
      // Administrador no encontrado o password inválida
    }
    return null;
  }

  async loginUsuario(usuario: Usuario) {
    // Si el usuario requiere verificación 2FA
    if (!usuario.verificado) {
      
      await this.verificacionDosFactoresService.enviarCodigoVerificacion(usuario.id, usuario.email);

      const payload2FA = { 
        email: usuario.email, 
        sub: usuario.id, 
        rol: usuario.rol,
        esToken2FA: true 
      };

      return {
        mensaje: 'Se ha enviado un código de verificación a tu email',
        requiereVerificacion: true,
        token_2FA: this.jwtService.sign(payload2FA, { expiresIn: '10m' }),
      };
    }
    
    const payload = { 
      email: usuario.email, 
      sub: usuario.id, 
      rol: usuario.rol 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
    };
  }

  async loginAdministrador(administrador: Administrador) {
    const payload = { 
      email: administrador.email, 
      sub: administrador.id, 
      rol: administrador.rol 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      administrador: {
        id: administrador.id,
        email: administrador.email,
        nombre: administrador.nombre,
        apellido: administrador.apellido,
        rol: administrador.rol,
      },
    };
  }

  async verificarCodigo2FA(usuarioId: string, codigo: string) {
    // ✅ CORRECCIÓN: Primero obtener el usuario por ID para obtener su email
    const usuario = await this.usuariosService.encontrarPorId(usuarioId);
    
    // ✅ CORRECCIÓN: Usar el email del usuario, no el ID
    const esValido = await this.verificacionDosFactoresService.verificarCodigo(usuario.email, codigo);
    
    if (esValido) {
      await this.usuariosService.marcarComoVerificado(usuarioId);
      
      const usuarioActualizado = await this.usuariosService.encontrarPorId(usuarioId);

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
    
    throw new UnauthorizedException('Código de verificación inválido');
  }
}