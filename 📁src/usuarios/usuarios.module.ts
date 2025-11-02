// En: src/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ← AÑADIR Config
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entidades/usuario.entity';
import { ServiciosExternosModule } from '../servicios-externos/servicios-externos.module';
import { CodigoVerificacion } from '../verificacion-dos-factores/entidades/codigo-verificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, CodigoVerificacion]),
    ServiciosExternosModule,
    JwtModule.registerAsync({ // ← CAMBIAR a registerAsync
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10m' }, // 10 minutos para token_2FA
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}