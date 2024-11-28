// src/auth/services/token.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenPayload, SessionMetadata } from '../interfaces/auth.interface';
import { jwtConfig } from '../../config/jwt.config';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TokenService {
 constructor(
   private jwtService: JwtService,
   private prisma: PrismaService
 ) {}

 async generateTokenPair(
   payload: TokenPayload, 
   metadata?: SessionMetadata
 ) {
   const [accessToken, refreshToken] = await Promise.all([
     this.jwtService.signAsync(
       { ...payload, type: 'access' },
       {
         algorithm: 'RS256',
         privateKey: jwtConfig.privateKey,
         expiresIn: jwtConfig.accessTokenExpiry
       }
     ),
     this.jwtService.signAsync(
       { ...payload, type: 'refresh' },
       {
         algorithm: 'RS256',
         privateKey: jwtConfig.privateKey,
         expiresIn: jwtConfig.refreshTokenExpiry
       }
     )
   ]);

   const session = await this.prisma.session.create({
     data: {
       userId: payload.sub,
       deviceInfo: metadata?.deviceInfo,
       ipAddress: metadata?.ipAddress,
       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
       lastActivity: new Date()
     }
   });

   return {
     accessToken,
     refreshToken,
     sessionId: session.id
   };
 }

 async verifyToken(token: string): Promise<TokenPayload | null> {
   try {
     return await this.jwtService.verifyAsync(token, {
       publicKey: jwtConfig.publicKey,
       algorithms: ['RS256']
     });
   } catch {
     return null;
   }
 }

 async updateSessionActivity(sessionId: string) {
   await this.prisma.session.update({
     where: { id: sessionId },
     data: { lastActivity: new Date() }
   });
 }

 async revokeSession(sessionId: string) {
   await this.prisma.session.update({
     where: { id: sessionId },
     data: { isRevoked: true }
   });
 }

 async revokeAllUserSessions(userId: string, exceptSessionId?: string) {
   await this.prisma.session.updateMany({
     where: {
       userId,
       id: exceptSessionId ? { not: exceptSessionId } : undefined,
       isRevoked: false
     },
     data: { isRevoked: true }
   });
 }

 async isSessionValid(sessionId: string): Promise<boolean> {
   const session = await this.prisma.session.findUnique({
     where: { id: sessionId }
   });

   return session 
     && !session.isRevoked 
     && session.expiresAt > new Date();
 }

 async getUserSessions(userId: string) {
   const sessions = await this.prisma.session.findMany({
     where: {
       userId,
       isRevoked: false,
       expiresAt: {
         gt: new Date()
       }
     },
     orderBy: {
       lastActivity: 'desc'
     },
     select: {
       id: true,
       deviceInfo: true,
       ipAddress: true,
       lastActivity: true,
       expiresAt: true
     }
   });

   return sessions.map(session => ({
     ...session,
     isCurrentSession: session.id === userId
   }));
 }

 @Cron('0 0 * * *') // Run daily
 async cleanupExpiredSessions() {
   await this.prisma.session.deleteMany({
     where: {
       OR: [
         { expiresAt: { lt: new Date() } },
         { isRevoked: true }
       ]
     }
   });
 }
}