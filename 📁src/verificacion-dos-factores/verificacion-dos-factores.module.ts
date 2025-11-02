// En: src/verificacion-dos-factores/verificacion-dos-factores.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerificacionDosFactoresService } from './verificacion-dos-factores.service';
import { VerificacionDosFactoresController } from './verificacion-dos-factores.controller';
import { CodigoVerificacion } from './entidades/codigo-verificacion.entity';
import { ServiciosExternosModule } from '../servicios-externos/servicios-externos.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CodigoVerificacion]),
    ServiciosExternosModule,
    forwardRef(() => AutenticacionModule),
    forwardRef(() => UsuariosModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [VerificacionDosFactoresService],
  controllers: [VerificacionDosFactoresController],
  exports: [VerificacionDosFactoresService],
})
export class VerificacionDosFactoresModule {}