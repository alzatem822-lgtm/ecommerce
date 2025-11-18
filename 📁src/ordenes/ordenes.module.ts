import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { Orden } from './entidades/orden.entity';
import { OrdenItem } from './entidades/orden-item.entity';
import { Producto } from '../productos/entidades/producto.entity';
import { Carrito } from '../carrito/entidades/carrito.entity';
import { CarritoItem } from '../carrito/entidades/carrito-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orden, 
      OrdenItem, 
      Producto, 
      Carrito, 
      CarritoItem
    ])
  ],
  providers: [OrdenesService],
  controllers: [OrdenesController],
  exports: [OrdenesService]
})
export class OrdenesModule {}