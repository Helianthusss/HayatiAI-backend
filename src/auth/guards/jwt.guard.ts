import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
 constructor(private tokenService: TokenService) {
   super();
 }

 async canActivate(context: ExecutionContext) {
   const request = context.switchToHttp().getRequest();
   const token = request.headers.authorization?.split(' ')[1];

   if (!token) {
     throw new UnauthorizedException('No token provided');
   }

   // Verify token and get payload
   const payload = await this.tokenService.verifyToken(token);
   if (!payload) {
     throw new UnauthorizedException('Invalid token');
   }

   // Check if session is valid
   if (payload.sessionId && !(await this.tokenService.isSessionValid(payload.sessionId))) {
     throw new UnauthorizedException('Session has been revoked or expired');
   }

   // Update last activity
   if (payload.sessionId) {
     await this.tokenService.updateSessionActivity(payload.sessionId);
   }

   // Add user and session info to request
   request.user = {
     id: payload.sub,
     email: payload.email,
     sessionId: payload.sessionId
   };

   return true;
 }
}