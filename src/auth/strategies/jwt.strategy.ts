import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { jwtConfig } from 'src/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    if (!jwtConfig.publicKey) {
      throw new Error('JWT public key is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.publicKey,
      algorithms: ['RS256']
    });
  }

  async validate(payload: { 
    sub: string; 
    email: string;
    type?: string;
    sessionId?: string;
  }) {
    // Verify token type
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if session exists
    if (!payload.sessionId) {
      throw new UnauthorizedException('No session found');
    }

    // Verify session is valid
    const session = await this.prisma.session.findUnique({
      where: {
        id: payload.sessionId,
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId
    };
  }
}

