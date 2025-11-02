import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AutenticacionService } from '../autenticacion.service';

@Injectable()
export class LocalEstrategia extends PassportStrategy(Strategy) {
  constructor(private autenticacionService: AutenticacionService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    // Primero intenta validar como usuario
    let user = await this.autenticacionService.validarUsuario(email, password);
    
    // Si no es usuario, intenta como administrador
    if (!user) {
      user = await this.autenticacionService.validarAdministrador(email, password);
    }

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    return user;
  }
}