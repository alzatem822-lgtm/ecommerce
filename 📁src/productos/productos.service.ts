import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entidades/producto.entity';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async crear(crearProductoDto: CrearProductoDto, administradorId: string): Promise<Producto> {
    try {
      const producto = this.productosRepository.create({
        ...crearProductoDto,
        administradorId,
      });

      return await this.productosRepository.save(producto);
    } catch (error) {
      console.error('Error creando producto:', error);
      throw new InternalServerErrorException(`Error al crear el producto: ${error.message}`);
    }
  }

  async encontrarTodos(): Promise<Producto[]> {
    return await this.productosRepository.find({
      where: { activo: true },
    });
  }

  async encontrarPorId(id: string): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id, activo: true },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async encontrarPorCategoria(categoria: string): Promise<Producto[]> {
    return await this.productosRepository.find({
      where: { categoria, activo: true },
    });
  }

  async actualizar(id: string, actualizarProductoDto: ActualizarProductoDto): Promise<Producto> {
    const producto = await this.encontrarPorId(id);
    
    await this.productosRepository.update(id, actualizarProductoDto);
    
    return await this.encontrarPorId(id);
  }

  async eliminar(id: string): Promise<void> {
    const producto = await this.encontrarPorId(id);
    
    // Soft delete - marcamos como inactivo en lugar de eliminar
    await this.productosRepository.update(id, { activo: false });
  }

  async reducirStock(id: string, cantidad: number): Promise<Producto> {
    const producto = await this.encontrarPorId(id);
    
    if (producto.stock < cantidad) {
      throw new ConflictException('Stock insuficiente');
    }

    producto.stock -= cantidad;
    return await this.productosRepository.save(producto);
  }
}