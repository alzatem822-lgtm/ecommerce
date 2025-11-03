import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Put, 
  Param, 
  Delete,
  ParseUUIDPipe,
  Req // ✅ AÑADIR este import
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';
import { RolesGuardia } from '../autenticacion/guardias/roles.guardia';
import { Roles } from '../autenticacion/decoradores/roles.decorador';
// ❌ ELIMINAR estos imports
// import { ObtenerUsuario } from '../autenticacion/decoradores/obtener-usuario.decorador';
// import { Usuario } from '../usuarios/entidades/usuario.entity';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // ✅ PÚBLICO: Cualquiera puede ver productos (se mantiene igual)
  @Get()
  async obtenerTodos() {
    return this.productosService.encontrarTodos();
  }

  // ✅ PÚBLICO: Cualquiera puede ver un producto específico (se mantiene igual)
  @Get(':id')
  async obtenerUno(@Param('id', ParseUUIDPipe) id: string) {
    return this.productosService.encontrarPorId(id);
  }

  // ✅ PÚBLICO: Filtrar por categoría (se mantiene igual)
  @Get('categoria/:categoria')
  async obtenerPorCategoria(@Param('categoria') categoria: string) {
    return this.productosService.encontrarPorCategoria(categoria);
  }

  // ✅ SOLO ADMIN: Crear producto - CORREGIR
  @Post()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async crear(
    @Body() crearProductoDto: CrearProductoDto,
    @Req() request: any // ✅ CAMBIAR: usar Request en lugar de ObtenerUsuario
  ) {
    // ✅ El administrador autenticado viene en request.user.id
    const administradorId = request.user.id;
    return this.productosService.crear(crearProductoDto, administradorId);
  }

  // ✅ SOLO ADMIN: Actualizar producto (se mantiene igual)
  @Put(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarProductoDto: ActualizarProductoDto
  ) {
    return this.productosService.actualizar(id, actualizarProductoDto);
  }

  // ✅ SOLO ADMIN: Eliminar producto (se mantiene igual)
  @Delete(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.productosService.eliminar(id);
  }
}