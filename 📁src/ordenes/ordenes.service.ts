import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Orden, EstadoOrden } from './entidades/orden.entity';
import { OrdenItem } from './entidades/orden-item.entity';
import { CrearOrdenDto } from './dto/crear-orden.dto';
import { ActualizarEstadoOrdenDto } from './dto/actualizar-estado-orden.dto';
import { OrdenResponseDto } from './dto/orden-response.dto';
import { Usuario } from '../usuarios/entidades/usuario.entity';
import { Producto } from '../productos/entidades/producto.entity';
import { Carrito } from '../carrito/entidades/carrito.entity';
import { CarritoItem } from '../carrito/entidades/carrito-item.entity';
import { NotificacionesService } from '../notificaciones/servicios/notificaciones.service';

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
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private notificacionesService: NotificacionesService,
  ) {}

  async crearDesdeCarrito(usuarioId: string, crearOrdenDto: CrearOrdenDto): Promise<OrdenResponseDto> {
    let ordenCreada;

    try {
      console.log('🔍 DEBUG: Iniciando creación de orden para usuario:', usuarioId);
      
      if (!usuarioId) {
        throw new BadRequestException('ID de usuario no válido');
      }

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

      const numeroOrden = await this.generarNumeroOrden();
      console.log('🔍 DEBUG: Número de orden generado:', numeroOrden);

      const orden = this.ordenRepository.create({
        usuarioId: usuarioId,
        total: carrito.total,
        estado: 'pendiente',
        direccion: crearOrdenDto.direccion,
        ciudad: crearOrdenDto.ciudad,
        codigoPostal: crearOrdenDto.codigoPostal,
        telefonoContacto: crearOrdenDto.telefonoContacto,
        numeroOrden,
      });

      console.log('🔍 DEBUG: Orden a crear:', orden);

      ordenCreada = await this.ordenRepository.save(orden);
      console.log('🔍 DEBUG: Orden guardada en BD:', ordenCreada);

      for (const itemCarrito of carrito.items) {
        console.log('🔍 DEBUG: Procesando item del carrito:', itemCarrito);
        
        const producto = await this.productoRepository.findOne({
          where: { id: itemCarrito.productoId },
        });

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

        console.log('🔍 DEBUG: Stock antes:', producto.stock);
        producto.stock -= itemCarrito.cantidad;
        console.log('🔍 DEBUG: Stock después:', producto.stock);
        
        await this.productoRepository.save(producto);
        console.log('🔍 DEBUG: Stock actualizado en BD');
      }

      console.log('🔍 DEBUG: Limpiando carrito ID:', carrito.id);
      await this.carritoItemRepository.delete({ carritoId: carrito.id });
      await this.carritoRepository.update(carrito.id, { total: 0 });
      console.log('🔍 DEBUG: Carrito limpiado');

      const ordenCompleta = await this.ordenRepository.findOne({
        where: { id: ordenCreada.id },
        relations: ['items', 'items.producto'],
      });

      console.log('🔍 DEBUG: Orden completa antes de transformar:', ordenCompleta);

      try {
        const usuario = await this.obtenerUsuarioParaNotificacion(usuarioId);
        const datosNotificacion = {
          numeroOrden: ordenCreada.numeroOrden,
          total: ordenCreada.total,
          items: ordenCompleta.items,
          direccion: ordenCreada.direccion,
          usuarioEmail: usuario.email,
          usuarioNombre: usuario.nombre,
        };

        await this.notificacionesService.enviarConfirmacionCompra(
          usuarioId,
          ordenCreada.id,
          datosNotificacion
        );
        console.log('📧 Notificación de confirmación enviada');
      } catch (error) {
        console.error('❌ Error enviando notificación:', error);
      }

      // ✅ CORREGIDO: Añadir configuración para excluir datos sensibles
      return plainToInstance(OrdenResponseDto, ordenCompleta, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });

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

  private async obtenerUsuarioParaNotificacion(usuarioId: string): Promise<{ email: string; nombre: string }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
      select: ['email', 'nombre', 'apellido']
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado para notificación');
    }

    return {
      email: usuario.email,
      nombre: `${usuario.nombre} ${usuario.apellido}`
    };
  }

  private async generarNumeroOrden(): Promise<string> {
    try {
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      
      const count = await this.ordenRepository.count();
      console.log('🔍 DEBUG: Count de órdenes existentes:', count);
      
      const sequential = String(count + 1).padStart(4, '0');
      const numeroOrden = `ORD-${year}${month}${day}-${sequential}`;
      
      console.log('🔍 DEBUG: Número de orden generado:', numeroOrden);
      return numeroOrden;
    } catch (error) {
      console.error('🔍 ERROR generando número de orden:', error);
      return `ORD-${Date.now()}`;
    }
  }

  async obtenerOrdenesUsuario(usuarioId: string): Promise<OrdenResponseDto[]> {
    const ordenes = await this.ordenRepository.find({
      where: { usuarioId },
      relations: ['items', 'items.producto'],
      order: { fechaCreacion: 'DESC' },
    });

    return plainToInstance(OrdenResponseDto, ordenes);
  }

  async obtenerOrdenPorId(id: string, usuarioId?: string): Promise<OrdenResponseDto> {
    const where: any = { id };
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const orden = await this.ordenRepository.findOne({
      where,
      relations: ['items', 'items.producto'],
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    return plainToInstance(OrdenResponseDto, orden);
  }

  async obtenerTodasOrdenes(): Promise<OrdenResponseDto[]> {
    const ordenes = await this.ordenRepository.find({
      relations: ['items', 'items.producto', 'usuario'],
      order: { fechaCreacion: 'DESC' },
    });

    return plainToInstance(OrdenResponseDto, ordenes);
  }

  async actualizarEstado(id: string, actualizarEstadoOrdenDto: ActualizarEstadoOrdenDto): Promise<OrdenResponseDto> {
    const orden = await this.obtenerOrdenPorId(id);
    
    await this.ordenRepository.update(id, { estado: actualizarEstadoOrdenDto.estado });
    
    return await this.obtenerOrdenPorId(id);
  }
}