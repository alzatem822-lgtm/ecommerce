// En: src/autenticacion/autenticacion.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { JwtEstrategia } from './estrategias/jwt.estrategia';
import { LocalEstrategia } from './estrategias/local.estrategia';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AdministradoresModule } from '../administradores/administradores.module';
import { VerificacionDosFactoresModule } from '../verificacion-dos-factores/verificacion-dos-factores.module';

@Module({
  imports: [
    UsuariosModule,
    AdministradoresModule,
    forwardRef(() => VerificacionDosFactoresModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AutenticacionService, JwtEstrategia, LocalEstrategia],
  controllers: [AutenticacionController],
  exports: [AutenticacionService],
})
export class AutenticacionModule {}