import { Expose, Type } from 'class-transformer';

// ✅ SOLO datos esenciales del producto - NADA INTERNO
export class ProductoResponseDto {
  @Expose()
  id: string;

  @Expose()
  nombre: string;

  @Expose()
  descripcion: string;

  @Expose()
  precio: number;

  @Expose()
  categoria: string;

  @Expose()
  imagenUrl: string;
  
  // ❌ EXCLUIDOS AUTOMÁTICAMENTE:
  // - stock
  // - activo  
  // - administradorId
  // - fechaCreacion
  // - fechaActualizacion
}

// ✅ SOLO datos esenciales del item - SIN IDs REDUNDANTES
export class OrdenItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  cantidad: number;

  @Expose()
  precioUnitario: number;

  @Expose()
  subtotal: number;

  @Expose()
  @Type(() => ProductoResponseDto)
  producto: ProductoResponseDto;
  
  // ❌ EXCLUIDOS AUTOMÁTICAMENTE:
  // - ordenId
  // - productoId
  // - fechaCreacion
}

// ✅ SOLO datos esenciales de la orden - SIN DATOS INTERNOS
export class OrdenResponseDto {
  @Expose()
  id: string;

  @Expose()
  total: number;

  @Expose()
  estado: string;

  @Expose()
  direccion: string;

  @Expose()
  ciudad: string;

  @Expose()
  codigoPostal: string;

  @Expose()
  telefonoContacto: string;

  @Expose()
  numeroOrden: string;

  @Expose()
  fechaCreacion: Date;

  @Expose()
  @Type(() => OrdenItemResponseDto)
  items: OrdenItemResponseDto[];
  
  // ❌ EXCLUIDOS AUTOMÁTICAMENTE:
  // - usuarioId
  // - fechaActualizacion
}