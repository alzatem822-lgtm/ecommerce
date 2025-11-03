// En: src/autenticacion/autenticacion.service.ts
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
    const payload = { 
      email: usuario.email, 
      sub: usuario.id, 
      rol: usuario.rol 
    };
    
    return {
      // ✅ Access token - 1 HORA
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
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
      // ✅ Access token - 1 HORA
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
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
    const usuario = await this.usuariosService.encontrarPorId(usuarioId);
    
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
        // ✅ Access token - 1 HORA
        access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
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