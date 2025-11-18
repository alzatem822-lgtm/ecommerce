import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Orden, EstadoOrden } from './entidades/orden.entity';
import { OrdenItem } from './entidades/orden-item.entity';
import { CrearOrdenDto } from './dto/crear-orden.dto';
import { ActualizarEstadoOrdenDto } from './dto/actualizar-estado-orden.dto';
import { Usuario } from '../usuarios/entidades/usuario.entity';
import { Producto } from '../productos/entidades/producto.entity';
import { Carrito } from '../carrito/entidades/carrito.entity';
import { CarritoItem } from '../carrito/entidades/carrito-item.entity';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,
    @InjectRepository(OrdenItem)
    private ordenItemRepository: Repository<OrdenItem>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Carrito)
    private carritoRepository: Repository<Carrito>,
    @InjectRepository(CarritoItem)
    private carritoItemRepository: Repository<CarritoItem>,
  ) {}

  async crearDesdeCarrito(usuarioId: string, crearOrdenDto: CrearOrdenDto): Promise<Orden> {
    try {
      console.log('🔍 DEBUG: Iniciando creación de orden para usuario:', usuarioId);
      
      // ✅ VALIDACIÓN CRÍTICA: Verificar que usuarioId no sea null/undefined
      if (!usuarioId) {
        throw new BadRequestException('ID de usuario no válido');
      }

      // 1. Obtener el carrito del usuario
      const carrito = await this.carritoRepository.findOne({
        where: { usuarioId },
        relations: ['items'],
      });

      console.log('🔍 DEBUG: Carrito encontrado:', JSON.stringify(carrito, null, 2));

      if (!carrito) {
        throw new ConflictException('No se encontró el carrito del usuario');
      }

      if (!carrito.items || carrito.items.length === 0) {
        throw new ConflictException('El carrito está vacío');
      }

      console.log('🔍 DEBUG: Items en carrito:', carrito.items);

      // 2. Verificar stock de todos los productos
      for (const item of carrito.items) {
        console.log('🔍 DEBUG: Verificando producto ID:', item.productoId);
        
        const producto = await this.productoRepository.findOne({
          where: { id: item.productoId, activo: true },
        });

        console.log('🔍 DEBUG: Producto encontrado:', producto);

        if (!producto) {
          throw new NotFoundException(`Producto con ID ${item.productoId} no disponible`);
        }

        if (producto.stock < item.cantidad) {
          throw new ConflictException(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`,
          );
        }
      }

      // 3. Generar número de orden único
      const numeroOrden = await this.generarNumeroOrden();
      console.log('🔍 DEBUG: Número de orden generado:', numeroOrden);

      // 4. Crear la orden - ✅ ASEGURAR que usuarioId tiene valor
      const orden = this.ordenRepository.create({
        usuarioId: usuarioId, // ✅ EXPLÍCITAMENTE asignado
        total: carrito.total,
        estado: 'pendiente',
        direccion: crearOrdenDto.direccion,
        ciudad: crearOrdenDto.ciudad,
        codigoPostal: crearOrdenDto.codigoPostal,
        telefonoContacto: crearOrdenDto.telefonoContacto,
        numeroOrden,
      });

      console.log('🔍 DEBUG: Orden a crear:', orden);

      const ordenCreada = await this.ordenRepository.save(orden);
      console.log('🔍 DEBUG: Orden guardada en BD:', ordenCreada);

      // 5. Crear items de la orden y reducir stock
      for (const itemCarrito of carrito.items) {
        console.log('🔍 DEBUG: Procesando item del carrito:', itemCarrito);
        
        const producto = await this.productoRepository.findOne({
          where: { id: itemCarrito.productoId },
        });

        // Crear item de orden
        const ordenItem = this.ordenItemRepository.create({
          ordenId: ordenCreada.id,
          productoId: itemCarrito.productoId,
          cantidad: itemCarrito.cantidad,
          precioUnitario: itemCarrito.precioUnitario,
          subtotal: itemCarrito.subtotal,
        });

        console.log('🔍 DEBUG: OrdenItem a crear:', ordenItem);

        await this.ordenItemRepository.save(ordenItem);
        console.log('🔍 DEBUG: OrdenItem guardado');

        // Reducir stock del producto
        console.log('🔍 DEBUG: Stock antes:', producto.stock);
        producto.stock -= itemCarrito.cantidad;
        console.log('🔍 DEBUG: Stock después:', producto.stock);
        
        await this.productoRepository.save(producto);
        console.log('🔍 DEBUG: Stock actualizado en BD');
      }

      // 6. Limpiar carrito
      console.log('🔍 DEBUG: Limpiando carrito ID:', carrito.id);
      await this.carritoItemRepository.delete({ carritoId: carrito.id });
      await this.carritoRepository.update(carrito.id, { total: 0 });
      console.log('🔍 DEBUG: Carrito limpiado');

      // 7. Devolver orden completa
      const ordenCompleta = await this.ordenRepository.findOne({
        where: { id: ordenCreada.id },
        relations: ['items', 'items.producto', 'usuario'],
      });

      console.log('🔍 DEBUG: Orden completa a devolver:', ordenCompleta);
      return ordenCompleta;

    } catch (error) {
      console.error('🔍 ERROR DETALLADO EN CREAR ORDEN:');
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('Error completo:', error);
      
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Error al crear la orden',
        detalle: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  private async generarNumeroOrden(): Promise<string> {
    try {
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      
      // Versión simplificada sin filtro de fecha
      const count = await this.ordenRepository.count();
      console.log('🔍 DEBUG: Count de órdenes existentes:', count);
      
      const sequential = String(count + 1).padStart(4, '0');
      const numeroOrden = `ORD-${year}${month}${day}-${sequential}`;
      
      console.log('🔍 DEBUG: Número de orden generado:', numeroOrden);
      return numeroOrden;
    } catch (error) {
      console.error('🔍 ERROR generando número de orden:', error);
      // Fallback si hay error
      return `ORD-${Date.now()}`;
    }
  }

  async obtenerOrdenesUsuario(usuarioId: string): Promise<Orden[]> {
    return await this.ordenRepository.find({
      where: { usuarioId },
      relations: ['items', 'items.producto'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerOrdenPorId(id: string, usuarioId?: string): Promise<Orden> {
    const where: any = { id };
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const orden = await this.ordenRepository.findOne({
      where,
      relations: ['items', 'items.producto', 'usuario'],
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    return orden;
  }

  async obtenerTodasOrdenes(): Promise<Orden[]> {
    return await this.ordenRepository.find({
      relations: ['items', 'items.producto', 'usuario'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async actualizarEstado(id: string, actualizarEstadoOrdenDto: ActualizarEstadoOrdenDto): Promise<Orden> {
    const orden = await this.obtenerOrdenPorId(id);
    
    await this.ordenRepository.update(id, { estado: actualizarEstadoOrdenDto.estado });
    
    return await this.obtenerOrdenPorId(id);
  }
}