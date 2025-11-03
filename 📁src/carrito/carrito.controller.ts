import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Req,
  ParseUUIDPipe
} from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { AgregarAlCarritoDto } from './dto/agregar-al-carrito.dto';
import { ActualizarCantidadDto } from './dto/actualizar-cantidad.dto';
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';

@Controller('carrito')
@UseGuards(JwtGuardia)
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Get()
  async obtenerCarrito(@Req() request: any) {
    const usuarioId = request.user.id;
    return this.carritoService.obtenerCarrito(usuarioId);
  }

  @Post('agregar')
  async agregarProducto(
    @Req() request: any,
    @Body() agregarAlCarritoDto: AgregarAlCarritoDto
  ) {
    const usuarioId = request.user.id;
    return this.carritoService.agregarProducto(usuarioId, agregarAlCarritoDto);
  }

  @Put('actualizar/:itemId')
  async actualizarCantidad(
    @Req() request: any,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() actualizarCantidadDto: ActualizarCantidadDto
  ) {
    const usuarioId = request.user.id;
    return this.carritoService.actualizarCantidad(usuarioId, itemId, actualizarCantidadDto);
  }

  @Delete('eliminar/:itemId')
  async eliminarItem(
    @Req() request: any,
    @Param('itemId', ParseUUIDPipe) itemId: string
  ) {
    const usuarioId = request.user.id;
    return this.carritoService.eliminarItem(usuarioId, itemId);
  }

  @Delete('limpiar')
  async limpiarCarrito(@Req() request: any) {
    const usuarioId = request.user.id;
    return this.carritoService.limpiarCarrito(usuarioId);
  }
}