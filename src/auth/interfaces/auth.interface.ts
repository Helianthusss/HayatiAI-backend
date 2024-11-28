export interface TokenPayload {
  sub: string;
  email?: string;
  type?: 'access' | 'refresh';
  sessionId?: string;
}

export interface SessionMetadata {
  deviceInfo?: string;
  ipAddress?: string;
  sessionId?: string; 
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: any;
}

export interface SocialLoginOptions {
  identifier: string;
  provider: string;
  fetchUser?: (token: string) => Promise<any>;
  userData?: {
    email?: string;
    name: string;
  };
}
