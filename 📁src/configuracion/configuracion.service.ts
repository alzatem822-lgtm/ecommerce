import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfiguracionService {
  constructor(private configService: ConfigService) {}

  get databaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST');
  }

  get databasePort(): number {
    return this.configService.get<number>('DATABASE_PORT');
  }

  get databaseName(): string {
    return this.configService.get<string>('DATABASE_NAME');
  }

  get databaseUser(): string {
    return this.configService.get<string>('DATABASE_USER');
  }

  get databasePassword(): string {
    return this.configService.get<string>('DATABASE_PASSWORD');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN');
  }

  get twilioAccountSid(): string {
    return this.configService.get<string>('TWILIO_ACCOUNT_SID');
  }

  get twilioAuthToken(): string {
    return this.configService.get<string>('TWILIO_AUTH_TOKEN');
  }

  get twilioPhoneNumber(): string {
    return this.configService.get<string>('TWILIO_PHONE_NUMBER');
  }
}