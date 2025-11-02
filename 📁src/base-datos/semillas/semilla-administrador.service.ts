// En: src/base-datos/semillas/semilla-administrador.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from '../../administradores/entidades/administrador.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SemillaAdministradorService implements OnModuleInit {
  private readonly logger = new Logger(SemillaAdministradorService.name);

  constructor(
    @InjectRepository(Administrador)
    private administradorRepository: Repository<Administrador>,
  ) {}

  async onModuleInit() {
    await this.crearAdministradorPorDefecto();
  }

  private async crearAdministradorPorDefecto(): Promise<void> {
    try {
      const emailAdmin = process.env.ADMIN_EMAIL || 'admin@ecommerce.com';
      const passwordAdmin = process.env.ADMIN_PASSWORD || 'Admin123!';
      
      const administradorExistente = await this.administradorRepository.findOne({
        where: { email: emailAdmin }
      });

      if (!administradorExistente) {
        const salt = await bcrypt.genSalt();
        const passwordHasheada = await bcrypt.hash(passwordAdmin, salt);

        const administrador = this.administradorRepository.create({
          email: emailAdmin,
          password: passwordHasheada,
          nombre: 'Administrador',
          apellido: 'Principal',
          rol: 'admin'
        });

        await this.administradorRepository.save(administrador);
        this.logger.log(`✅ Administrador por defecto creado: ${emailAdmin}`);
        this.logger.log(`🔐 Password: ${passwordAdmin} (cámbialo en producción)`);
      } else {
        this.logger.log('ℹ️  Administrador por defecto ya existe');
      }
    } catch (error) {
      this.logger.error('❌ Error creando administrador por defecto:', error);
    }
  }
}