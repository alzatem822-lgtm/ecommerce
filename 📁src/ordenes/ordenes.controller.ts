import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Put, 
  Param, 
  ParseUUIDPipe,
  Req,
  BadRequestException
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CrearOrdenDto } from './dto/crear-orden.dto';
import { ActualizarEstadoOrdenDto } from './dto/actualizar-estado-orden.dto';
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';
import { RolesGuardia } from '../autenticacion/guardias/roles.guardia';
import { Roles } from '../autenticacion/decoradores/roles.decorador';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post('crear')
  @UseGuards(JwtGuardia)
  async crearOrden(
    @Req() request: any,
    @Body() crearOrdenDto: CrearOrdenDto
  ) {
    console.log('🔍 DEBUG - Request user completo:', JSON.stringify(request.user, null, 2));
    console.log('🔍 DEBUG - Request user tipo:', typeof request.user);
    console.log('🔍 DEBUG - Request user keys:', request.user ? Object.keys(request.user) : 'NO USER');
    
    // Probar diferentes formas de obtener el ID
    const usuarioId = request.user?.sub || 
                     request.user?.id || 
                     request.user?.usuarioId ||
                     request.user?.userId ||
                     request.user?.user?.id;

    console.log('🔍 DEBUG - UsuarioID probado:', {
      sub: request.user?.sub,
      id: request.user?.id,
      usuarioId: request.user?.usuarioId,
      userId: request.user?.userId,
      user_id: request.user?.user?.id,
      final: usuarioId
    });

    if (!usuarioId) {
      console.error('🔍 ERROR - No se pudo encontrar usuarioId en:', request.user);
      throw new BadRequestException({
        message: 'No se pudo obtener el ID del usuario del token JWT',
        userReceived: request.user,
        possibleFields: ['sub', 'id', 'usuarioId', 'userId', 'user.id']
      });
    }

    console.log('🔍 DEBUG - Llamando servicio con usuarioId:', usuarioId);
    return this.ordenesService.crearDesdeCarrito(usuarioId, crearOrdenDto);
  }

  @Get('mis-ordenes')
  @UseGuards(JwtGuardia)
  async obtenerMisOrdenes(@Req() request: any) {
    console.log('🔍 DEBUG - Obteniendo órdenes para user:', request.user);
    const usuarioId = request.user?.sub || request.user?.id || request.user?.usuarioId;
    
    if (!usuarioId) {
      throw new BadRequestException('No se pudo obtener el ID del usuario');
    }
    
    return this.ordenesService.obtenerOrdenesUsuario(usuarioId);
  }

  @Get(':id')
  @UseGuards(JwtGuardia)
  async obtenerOrden(
    @Req() request: any,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const usuarioId = request.user?.sub || request.user?.id || request.user?.usuarioId;
    
    if (!usuarioId) {
      throw new BadRequestException('No se pudo obtener el ID del usuario');
    }
    
    // Usuario normal solo puede ver sus propias órdenes
    return this.ordenesService.obtenerOrdenPorId(id, usuarioId);
  }

  @Get()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async obtenerTodasOrdenes() {
    return this.ordenesService.obtenerTodasOrdenes();
  }

  @Put(':id/estado')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async actualizarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarEstadoOrdenDto: ActualizarEstadoOrdenDto
  ) {
    return this.ordenesService.actualizarEstado(id, actualizarEstadoOrdenDto);
  }
}