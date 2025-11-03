import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

    // Verificar que el producto existe y está activo
    const producto = await this.productoRepository.findOne({
      where: { id: productoId, activo: true },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado o no disponible');
    }

    // Verificar stock
    if (producto.stock < cantidad) {
      throw new ConflictException('Stock insuficiente');
    }

    const carrito = await this.obtenerCarrito(usuarioId);

    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.items.find(item => item.productoId === productoId);

    if (itemExistente) {
      // Actualizar cantidad si ya existe
      itemExistente.cantidad += cantidad;
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
      carrito.items.push(nuevoItem);
      await this.carritoItemRepository.save(nuevoItem);
    }

    // Recalcular total y guardar carrito
    carrito.calcularTotal();
    await this.carritoRepository.save(carrito);

    return await this.obtenerCarrito(usuarioId);
  }

  async actualizarCantidad(usuarioId: string, itemId: string, actualizarCantidadDto: ActualizarCantidadDto): Promise<Carrito> {
    const { cantidad } = actualizarCantidadDto;

    const carrito = await this.obtenerCarrito(usuarioId);
    const item = carrito.items.find(item => item.id === itemId);

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
      throw new ConflictException('Stock insuficiente');
    }

    // Actualizar cantidad y subtotal
    item.cantidad = cantidad;
    item.subtotal = cantidad * item.precioUnitario;
    await this.carritoItemRepository.save(item);

    // Recalcular total del carrito
    carrito.calcularTotal();
    await this.carritoRepository.save(carrito);

    return await this.obtenerCarrito(usuarioId);
  }

  async eliminarItem(usuarioId: string, itemId: string): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);
    const itemIndex = carrito.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    // Eliminar item
    await this.carritoItemRepository.delete(itemId);

    // Recalcular total
    carrito.calcularTotal();
    await this.carritoRepository.save(carrito);

    return await this.obtenerCarrito(usuarioId);
  }

  async limpiarCarrito(usuarioId: string): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);

    // Eliminar todos los items del carrito
    await this.carritoItemRepository.delete({ carritoId: carrito.id });

    // Resetear total
    carrito.total = 0;
    await this.carritoRepository.save(carrito);

    return await this.obtenerCarrito(usuarioId);
  }
}