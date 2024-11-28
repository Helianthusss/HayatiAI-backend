import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { jwtConfig } from 'src/config/jwt.config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      privateKey: jwtConfig.privateKey,
      publicKey: jwtConfig.publicKey,
      signOptions: { 
        algorithm: 'RS256',
        expiresIn: jwtConfig.accessTokenExpiry 
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,  // Make sure TokenService is listed here
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, TokenService]
})
export class AuthModule {}