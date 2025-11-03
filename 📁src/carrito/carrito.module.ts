import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { Carrito } from './entidades/carrito.entity';
import { CarritoItem } from './entidades/carrito-item.entity';
import { Producto } from '../productos/entidades/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrito, CarritoItem, Producto])
  ],
  providers: [CarritoService],
  controllers: [CarritoController],
  exports: [CarritoService]
})
export class CarritoModule {}