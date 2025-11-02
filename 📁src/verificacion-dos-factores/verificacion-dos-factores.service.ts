// En: src/verificacion-dos-factores/verificacion-dos-factores.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodigoVerificacion } from './entidades/codigo-verificacion.entity';
import { ServicioEmailService } from '../servicios-externos/servicio-email.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class VerificacionDosFactoresService {
  private readonly logger = new Logger(VerificacionDosFactoresService.name);

  constructor(
    @InjectRepository(CodigoVerificacion)
    private readonly repositorioCodigo: Repository<CodigoVerificacion>,
    private readonly servicioEmail: ServicioEmailService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async enviarCodigoVerificacion(usuarioId: string, email: string): Promise<any> {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 10);

    try {
      await this.repositorioCodigo.delete({ usuarioId });

      const nuevoCodigo = this.repositorioCodigo.create({
        codigo,
        usuarioId,
        expiracion,
      });
      await this.repositorioCodigo.save(nuevoCodigo);

      await this.servicioEmail.enviarEmailVerificacion(email, codigo);

      this.logger.log(`Código de verificación enviado por email a ${email} para usuario ${usuarioId}`);
      return { mensaje: 'Código de verificación enviado al email.' };

    } catch (error) {
      this.logger.error(`Error al enviar código para usuario ${usuarioId}`, error);
      throw new InternalServerErrorException('No se pudo enviar el código de verificación.');
    }
  }

  async verificarCodigo(email: string, codigo: string): Promise<boolean> {
    try {
      this.logger.log(`🔍 VERIFICANDO código: "${codigo}" para email: "${email}"`);
      
      // 1. Buscar usuario por email para obtener el ID
      const usuario = await this.usuariosService.encontrarPorEmail(email);
      this.logger.log(`🔍 USUARIO ENCONTRADO: ${usuario.id} (${usuario.email})`);
      
      // 2. Buscar TODOS los códigos para este usuario (para debug)
      const todosLosCodigos = await this.repositorioCodigo.find({
        where: { usuarioId: usuario.id },
      });
      this.logger.log(`🔍 CÓDIGOS EN BD para este usuario:`, todosLosCodigos.map(c => ({ codigo: c.codigo, expiracion: c.expiracion })));
      
      // 3. Buscar el código específico
      const registroCodigo = await this.repositorioCodigo.findOne({
        where: { usuarioId: usuario.id, codigo },
      });

      this.logger.log(`🔍 REGISTRO BUSCADO: usuarioId=${usuario.id}, codigo=${codigo}`);
      this.logger.log(`🔍 REGISTRO ENCONTRADO:`, registroCodigo);

      if (!registroCodigo) {
        this.logger.warn(`❌ Código NO encontrado en BD`);
        this.logger.warn(`❌ Se buscó: "${codigo}"`);
        this.logger.warn(`❌ Códigos en BD: ${todosLosCodigos.map(c => c.codigo).join(', ')}`);
        return false;
      }

      this.logger.log(`🔍 EXPIRACIÓN: ${registroCodigo.expiracion}`);
      this.logger.log(`🔍 AHORA: ${new Date()}`);
      
      if (registroCodigo.expiracion < new Date()) {
        this.logger.warn(`❌ Código EXPIRADO`);
        await this.repositorioCodigo.delete(registroCodigo.id);
        return false;
      }

      // Código válido - eliminarlo
      await this.repositorioCodigo.delete(registroCodigo.id);
      this.logger.log(`✅ CÓDIGO VÁLIDO - verificación exitosa`);
      return true;
    } catch (error) {
      this.logger.error(`💥 ERROR en verificación:`, error);
      return false;
    }
  }
}