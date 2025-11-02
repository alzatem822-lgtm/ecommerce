// En: src/usuarios/usuarios.service.ts
import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entidades/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import * as bcrypt from 'bcryptjs';
import { ServicioEmailService } from '../servicios-externos/servicio-email.service';
import { CodigoVerificacion } from '../verificacion-dos-factores/entidades/codigo-verificacion.entity';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto'; // ← AÑADIR
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto'; // ← AÑADIR


@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(CodigoVerificacion)
    private codigoVerificacionRepository: Repository<CodigoVerificacion>,
    private readonly servicioEmailService: ServicioEmailService,
  ) {}

  async crear(crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    const { email, telefono, password } = crearUsuarioDto;

    this.logger.log(`🔍 INICIANDO REGISTRO para: ${email}`);

    const usuarioExistente = await this.usuariosRepository.findOne({
      where: [{ email }, { telefono }],
    });

    if (usuarioExistente) {
      throw new ConflictException('El usuario con este email o teléfono ya existe');
    }

    const salt = await bcrypt.genSalt();
    const passwordHasheada = await bcrypt.hash(password, salt);

    const usuario = this.usuariosRepository.create({
      ...crearUsuarioDto,
      password: passwordHasheada,
      verificado: false,
    });

    const usuarioCreado = await this.usuariosRepository.save(usuario);
    
    this.logger.log(`🔍 USUARIO CREADO: ${usuarioCreado.id}`);
    
    // ✅ GUARDAR EL CÓDIGO EN LA BASE DE DATOS
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 10);

    this.logger.log(`🔍 CÓDIGO GENERADO: ${codigo} para usuario: ${usuarioCreado.id}`);

    // Guardar código en la base de datos
    const codigoVerificacion = this.codigoVerificacionRepository.create({
      codigo,
      usuarioId: usuarioCreado.id,
      expiracion,
    });
    await this.codigoVerificacionRepository.save(codigoVerificacion);

    this.logger.log(`🔍 CÓDIGO GUARDADO EN BD: ${codigo}`);

    // Enviar email
    await this.servicioEmailService.enviarEmailVerificacion(usuarioCreado.email, codigo);

    this.logger.log(`🔍 EMAIL ENVIADO con código: ${codigo}`);
    
    return usuarioCreado;
  }

  async encontrarPorEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({ where: { email } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async encontrarPorTelefono(telefono: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({ where: { telefono } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async encontrarPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async obtenerTodos(): Promise<Usuario[]> {
    return await this.usuariosRepository.find();
  }

  async validarPassword(usuario: Usuario, password: string): Promise<boolean> {
    return await bcrypt.compare(password, usuario.password);
  }

  async marcarComoVerificado(id: string): Promise<void> {
    await this.usuariosRepository.update(id, { verificado: true });
  }

async actualizarPerfil(id: string, actualizarPerfilDto: ActualizarPerfilDto): Promise<Usuario> {
  const usuario = await this.encontrarPorId(id);
  
  // Si viene password, la hasheamos
  if (actualizarPerfilDto.password) {
    const salt = await bcrypt.genSalt();
    actualizarPerfilDto.password = await bcrypt.hash(actualizarPerfilDto.password, salt);
  }

  // Actualizar solo campos permitidos
  await this.usuariosRepository.update(id, actualizarPerfilDto);
  
  // Devolver usuario actualizado
  return await this.encontrarPorId(id);
}

async actualizarUsuario(id: string, actualizarUsuarioDto: ActualizarUsuarioDto): Promise<Usuario> {
  const usuario = await this.encontrarPorId(id);
  
  // Si viene password, la hasheamos
  if (actualizarUsuarioDto.password) {
    const salt = await bcrypt.genSalt();
    actualizarUsuarioDto.password = await bcrypt.hash(actualizarUsuarioDto.password, salt);
  }

  // Actualizar todos los campos (admin puede editar todo)
  await this.usuariosRepository.update(id, actualizarUsuarioDto);
  
  // Devolver usuario actualizado
  return await this.encontrarPorId(id);
}

async eliminarUsuario(id: string): Promise<void> {
  const usuario = await this.encontrarPorId(id);
  await this.usuariosRepository.delete(id);
}

}