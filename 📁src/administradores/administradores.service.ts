import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from './entidades/administrador.entity';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdministradoresService {
  constructor(
    @InjectRepository(Administrador)
    private administradoresRepository: Repository<Administrador>,
  ) {}

  async crear(crearAdministradorDto: CrearAdministradorDto): Promise<Administrador> {
    const { email } = crearAdministradorDto;

    const administradorExistente = await this.administradoresRepository.findOne({
      where: { email },
    });

    if (administradorExistente) {
      throw new ConflictException('El administrador con este email ya existe');
    }

    const salt = await bcrypt.genSalt();
    const passwordHasheada = await bcrypt.hash(crearAdministradorDto.password, salt);

    const administrador = this.administradoresRepository.create({
      ...crearAdministradorDto,
      password: passwordHasheada,
    });

    return await this.administradoresRepository.save(administrador);
  }

  async encontrarPorEmail(email: string): Promise<Administrador> {
    const administrador = await this.administradoresRepository.findOne({ where: { email } });
    if (!administrador) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return administrador;
  }

  async encontrarPorId(id: string): Promise<Administrador> {
    const administrador = await this.administradoresRepository.findOne({ where: { id } });
    if (!administrador) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return administrador;
  }

  async obtenerTodos(): Promise<Administrador[]> {
    return await this.administradoresRepository.find();
  }

  async validarPassword(administrador: Administrador, password: string): Promise<boolean> {
    return await bcrypt.compare(password, administrador.password);
  }
}