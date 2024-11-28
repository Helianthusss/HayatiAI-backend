import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { SignUpDto, SignInDto, ChangePasswordDto } from './dto/auth.dto';
import { GoogleAuthDto, TelegramAuthDto, WhatsAppAuthDto } from './dto/social-auth.dto';
import { AuthResponse, SessionMetadata, SocialLoginOptions } from './interfaces/auth.interface';
import { LogoutResponseDto, ChangePasswordResponseDto } from './dto/responses.dto';
import axios from 'axios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async signUp(dto: SignUpDto, metadata?: SessionMetadata): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        provider: 'local',
      },
    });

    const tokens = await this.tokenService.generateTokenPair(
      { sub: user.id, email: user.email },
      metadata
    );

    return { 
      user: this.excludePassword(user), 
      ...tokens 
    };
  }

  async signIn(dto: SignInDto, metadata?: SessionMetadata): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.tokenService.generateTokenPair(
      { sub: user.id, email: user.email },
      metadata
    );

    return { 
      user: this.excludePassword(user), 
      ...tokens 
    };
  }


  async logout(userId: string, sessionId: string): Promise<LogoutResponseDto> {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        isRevoked: false
      },
      include: {
        user: true
      }
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { 
        isRevoked: true,
        lastActivity: new Date()
      }
    });

    return {
      message: 'Logged out successfully',
      sessionId
    };
  }

  async logoutAll(userId: string, currentSessionId: string): Promise<LogoutResponseDto> {
    await this.tokenService.revokeAllUserSessions(userId, currentSessionId);
    
    return {
      message: 'All other sessions logged out successfully',
      sessionId: currentSessionId
    };
  }

  async changePassword(
    userId: string, 
    dto: ChangePasswordDto, 
    sessionId: string
  ): Promise<ChangePasswordResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('User not found or social login user');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    const tokens = await this.tokenService.generateTokenPair(
      { sub: user.id, email: user.email },
      { 
        deviceInfo: 'Password Change',
        sessionId 
      }
    );

    await this.tokenService.revokeAllUserSessions(userId, tokens.sessionId);

    return {
      message: 'Password changed successfully',
      ...tokens
    };
  }

  async googleLogin(dto: GoogleAuthDto, metadata?: SessionMetadata) {
    return this.socialLogin({
      identifier: dto.accessToken,
      provider: 'google',
      fetchUser: async token => 
        axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        }),
    }, metadata);
  }

  async telegramLogin(dto: TelegramAuthDto, metadata?: SessionMetadata) {
    return this.findOrCreateSocialUser({
      identifier: dto.id.toString(),
      provider: 'telegram',
      userData: {
        name: `${dto.first_name} ${dto.last_name || ''}`.trim(),
      }
    }, metadata);
  }

  async whatsappLogin(dto: WhatsAppAuthDto, metadata?: SessionMetadata) {
    return this.findOrCreateSocialUser({
      identifier: dto.phoneNumber,
      provider: 'whatsapp',
      userData: { name: dto.name }
    }, metadata);
  }

  private async socialLogin(options: SocialLoginOptions, metadata?: SessionMetadata) {
    try {
      const { identifier, provider, fetchUser } = options;
      const { data } = await fetchUser(identifier);
      const { sub, email, name } = data;

      return this.findOrCreateSocialUser({
        identifier: sub,
        provider,
        userData: { email, name }
      }, metadata);
    } catch {
      throw new UnauthorizedException('Invalid social login');
    }
  }

  private async findOrCreateSocialUser(
    options: SocialLoginOptions,
    metadata?: SessionMetadata
  ): Promise<AuthResponse> {
    const { identifier, provider, userData } = options;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { [`${provider}Id`]: identifier }
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          ...userData,
          [`${provider}Id`]: identifier,
          provider
        },
      });
    } else if (!user[`${provider}Id`]) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { [`${provider}Id`]: identifier },
      });
    }

    const tokens = await this.tokenService.generateTokenPair(
      { sub: user.id, email: user.email },
      metadata
    );

    return {
      user: this.excludePassword(user),
      ...tokens
    };
  }

  private excludePassword(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}