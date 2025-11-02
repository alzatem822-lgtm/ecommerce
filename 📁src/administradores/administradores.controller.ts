import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AdministradoresService } from './administradores.service';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';
import { JwtGuardia } from '../autenticacion/guardias/jwt.guardia';
import { RolesGuardia } from '../autenticacion/guardias/roles.guardia';
import { Roles } from '../autenticacion/decoradores/roles.decorador';

@Controller('administradores')
export class AdministradoresController {
  constructor(private readonly administradoresService: AdministradoresService) {}

  @Post('registro')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async registrar(@Body() crearAdministradorDto: CrearAdministradorDto) {
    return this.administradoresService.crear(crearAdministradorDto);
  }

  @Get()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles('admin')
  async obtenerTodos() {
    return this.administradoresService.obtenerTodos();
  }
}