// En: src/base-datos/base-datos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from '../administradores/entidades/administrador.entity';
import { SemillaAdministradorService } from './semillas/semilla-administrador.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Administrador]), // ← AÑADIR esta línea
  ],
  providers: [SemillaAdministradorService],
  exports: [SemillaAdministradorService],
})
export class BaseDatosModule {}