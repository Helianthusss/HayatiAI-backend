// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body, 
  UseGuards, 
  Req, 
  Put,
  Get
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request } from 'express';
import {
    GoogleAuthDto,
    TelegramAuthDto,
    WhatsAppAuthDto,
} from './dto/social-auth.dto';
import { 
    SignUpDto, 
    SignInDto, 
    ChangePasswordDto
} from './dto/auth.dto';

import { LogoutResponseDto } from './dto/responses.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Successfully registered' })
  async signUp(@Req() req: Request, @Body() dto: SignUpDto) {
    const metadata = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };
    return this.authService.signUp(dto, metadata);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  async signIn(@Req() req: Request, @Body() dto: SignInDto) {
    const metadata = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };
    return this.authService.signIn(dto, metadata);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user from current session' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully logged out',
    type: LogoutResponseDto  
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid token or session'
  })
  async logout(@Req() req): Promise<LogoutResponseDto> {
    return this.authService.logout(req.user.id, req.user.sessionId);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all other sessions' })
  @ApiResponse({ status: 200, description: 'Successfully logged out from all devices' })
  async logoutAll(@Req() req) {
    return this.authService.logoutAll(req.user.id, req.user.sessionId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getSessions(@Req() req) {
    return this.tokenService.getUserSessions(req.user.id);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id, 
      dto, 
      req.user.sessionId
    );
  }

  @Post('google/login')
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  async googleLogin(@Req() req: Request, @Body() dto: GoogleAuthDto) {
    const metadata = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };
    return this.authService.googleLogin(dto, metadata);
  }

  @Post('telegram/login')
  @ApiOperation({ summary: 'Login with Telegram' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  async telegramLogin(@Req() req: Request, @Body() dto: TelegramAuthDto) {
    const metadata = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };
    return this.authService.telegramLogin(dto, metadata);
  }

  @Post('whatsapp/login')
  @ApiOperation({ summary: 'Login with WhatsApp' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  async whatsappLogin(@Req() req: Request, @Body() dto: WhatsAppAuthDto) {
    const metadata = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };
    return this.authService.whatsappLogin(dto, metadata);
  }
}