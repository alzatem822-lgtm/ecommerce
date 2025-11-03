import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from './entidades/carrito.entity';
import { CarritoItem } from './entidades/carrito-item.entity';
import { Producto } from '../productos/entidades/producto.entity';
import { AgregarAlCarritoDto } from './dto/agregar-al-carrito.dto';
import { ActualizarCantidadDto } from './dto/actualizar-cantidad.dto';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private carritoRepository: Repository<Carrito>,
    @InjectRepository(CarritoItem)
    private carritoItemRepository: Repository<CarritoItem>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async obtenerCarrito(usuarioId: string): Promise<Carrito> {
    let carrito = await this.carritoRepository.findOne({
      where: { usuarioId },
      relations: ['items', 'items.producto'],
    });

    if (!carrito) {
      carrito = this.carritoRepository.create({
        usuarioId,
        items: [],
        total: 0,
      });
      await this.carritoRepository.save(carrito);
    }

    return carrito;
  }

  async agregarProducto(usuarioId: string, agregarAlCarritoDto: AgregarAlCarritoDto): Promise<Carrito> {
    const { productoId, cantidad } = agregarAlCarritoDto;

    try {
      // Verificar que el producto existe y está activo
      const producto = await this.productoRepository.findOne({
        where: { id: productoId, activo: true },
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado o no disponible');
      }

      // Verificar stock disponible
      if (producto.stock < cantidad) {
        throw new ConflictException(`Stock insuficiente. Solo quedan ${producto.stock} unidades disponibles`);
      }

      const carrito = await this.obtenerCarrito(usuarioId);

      // Verificar si el producto ya está en el carrito
      const itemExistente = await this.carritoItemRepository.findOne({
        where: { 
          carritoId: carrito.id, 
          productoId: productoId 
        },
        relations: ['producto']
      });

      if (itemExistente) {
        // ✅ CORRECCIÓN: Verificar stock total (cantidad actual + nueva)
        const cantidadTotal = itemExistente.cantidad + cantidad;
        if (producto.stock < cantidadTotal) {
          throw new ConflictException(`Stock insuficiente. No puedes agregar ${cantidad} más. Máximo disponible: ${producto.stock - itemExistente.cantidad}`);
        }

        // Actualizar cantidad si ya existe
        itemExistente.cantidad = cantidadTotal;
        itemExistente.subtotal = itemExistente.cantidad * producto.precio;
        await this.carritoItemRepository.save(itemExistente);
      } else {
        // Crear nuevo item
        const nuevoItem = this.carritoItemRepository.create({
          carritoId: carrito.id,
          productoId,
          cantidad,
          precioUnitario: producto.precio,
          subtotal: cantidad * producto.precio,
        });
        await this.carritoItemRepository.save(nuevoItem);
      }

      // ✅ CORRECCIÓN: Recalcular total correctamente
      await this.recalcularTotalCarrito(carrito.id);

      return await this.obtenerCarrito(usuarioId);

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error agregando producto al carrito:', error);
      throw new InternalServerErrorException('Error al agregar producto al carrito');
    }
  }

  async actualizarCantidad(usuarioId: string, itemId: string, actualizarCantidadDto: ActualizarCantidadDto): Promise<Carrito> {
    const { cantidad } = actualizarCantidadDto;

    try {
      const carrito = await this.obtenerCarrito(usuarioId);
      const item = await this.carritoItemRepository.findOne({
        where: { id: itemId, carritoId: carrito.id },
        relations: ['producto']
      });

      if (!item) {
        throw new NotFoundException('Item no encontrado en el carrito');
      }

      // Verificar stock del producto
      const producto = await this.productoRepository.findOne({
        where: { id: item.productoId, activo: true },
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }

      if (producto.stock < cantidad) {
        throw new ConflictException(`Stock insuficiente. Solo quedan ${producto.stock} unidades disponibles`);
      }

      // Actualizar cantidad y subtotal
      item.cantidad = cantidad;
      item.subtotal = cantidad * item.precioUnitario;
      await this.carritoItemRepository.save(item);

      // ✅ CORRECCIÓN: Recalcular total correctamente
      await this.recalcularTotalCarrito(carrito.id);

      return await this.obtenerCarrito(usuarioId);

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error actualizando cantidad:', error);
      throw new InternalServerErrorException('Error al actualizar cantidad');
    }
  }

  async eliminarItem(usuarioId: string, itemId: string): Promise<Carrito> {
    try {
      const carrito = await this.obtenerCarrito(usuarioId);
      const item = await this.carritoItemRepository.findOne({
        where: { id: itemId, carritoId: carrito.id }
      });

      if (!item) {
        throw new NotFoundException('Item no encontrado en el carrito');
      }

      // Eliminar item
      await this.carritoItemRepository.delete(itemId);

      // ✅ CORRECCIÓN: Recalcular total correctamente
      await this.recalcularTotalCarrito(carrito.id);

      return await this.obtenerCarrito(usuarioId);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error eliminando item:', error);
      throw new InternalServerErrorException('Error al eliminar item del carrito');
    }
  }

  async limpiarCarrito(usuarioId: string): Promise<Carrito> {
    try {
      const carrito = await this.obtenerCarrito(usuarioId);

      console.log(`🔄 Limpiando carrito ${carrito.id}. Items encontrados:`, carrito.items.length);

      // ✅ SOLUCIÓN NUCLEAR: Eliminar item por item
      let itemsEliminados = 0;
      for (const item of carrito.items) {
        await this.carritoItemRepository.delete(item.id);
        itemsEliminados++;
      }

      console.log(`✅ Items eliminados uno por uno:`, itemsEliminados);

      // ✅ Actualizar total a 0
      await this.carritoRepository.update(carrito.id, { total: 0 });

      // ✅ Devolver carrito fresco
      const carritoLimpio = await this.carritoRepository.findOne({
        where: { id: carrito.id },
        relations: ['items', 'items.producto'],
      });

      console.log(`🔍 Carrito después de limpiar - Items:`, carritoLimpio.items.length);

      return carritoLimpio;

    } catch (error) {
      console.error('❌ Error limpiando carrito:', error);
      throw new InternalServerErrorException('Error al limpiar carrito');
    }
  }

  // ✅ NUEVO MÉTODO: Recalcular total del carrito
  private async recalcularTotalCarrito(carritoId: string): Promise<void> {
    const items = await this.carritoItemRepository.find({
      where: { carritoId },
      relations: ['producto']
    });

    const total = items.reduce((sum, item) => {
      return sum + (item.cantidad * item.precioUnitario);
    }, 0);

    await this.carritoRepository.update(carritoId, { total });
  }
}