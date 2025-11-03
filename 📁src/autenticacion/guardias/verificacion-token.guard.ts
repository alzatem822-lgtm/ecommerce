import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VerificacionTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de verificación no proporcionado');
    }

    try {
      // ✅ Verificar con secreto ESPECIAL
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_VERIFICACION_SECRET || 'secreto_verificacion_diferente'
      });
      
      // ✅ Verificar que es un token de verificación
      if (payload.tipo !== 'verificacion_2fa') {
        throw new UnauthorizedException('Tipo de token inválido');
      }

      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token de verificación inválido o expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}