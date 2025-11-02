import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministradoresService } from './administradores.service';
import { AdministradoresController } from './administradores.controller';
import { Administrador } from './entidades/administrador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Administrador])],
  providers: [AdministradoresService],
  controllers: [AdministradoresController],
  exports: [AdministradoresService],
})
export class AdministradoresModule {}