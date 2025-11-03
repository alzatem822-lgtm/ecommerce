// En: src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AdministradoresModule } from './administradores/administradores.module';
import { VerificacionDosFactoresModule } from './verificacion-dos-factores/verificacion-dos-factores.module';
import { ServiciosExternosModule } from './servicios-externos/servicios-externos.module';
import { BaseDatosModule } from './base-datos/base-datos.module';
import { ProductosModule } from './productos/productos.module'; // ← NUEVA IMPORTACIÓN

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
    AutenticacionModule,
    UsuariosModule,
    AdministradoresModule,
    VerificacionDosFactoresModule,
    ServiciosExternosModule,
    BaseDatosModule,
    ProductosModule, // ← AÑADIR esta línea
  ],
})
export class AppModule {}