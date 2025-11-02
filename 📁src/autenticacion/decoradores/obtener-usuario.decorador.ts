// En: src/autenticacion/decoradores/obtener-usuario.decorador.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para extraer el objeto 'usuario' del request
 * después de que JwtGuardia lo haya validado e inyectado.
 */
export const ObtenerUsuario = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // 'user' es la propiedad que JwtStrategy añade al request
    return request.user;
  },
);