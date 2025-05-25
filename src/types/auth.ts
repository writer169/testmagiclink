// Типы для аутентификации

export interface SessionPayload {
  appId: string;
  authorizedAt: number;
  isAuthorized: boolean;
  sessionId: string;
}

export interface MagicLinkData {
  appId: string;
  createdAt: number;
  expiresAt: number;
  used?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  session?: {
    appId: string;
    sessionId: string;
    authorizedAt: number;
  };
  error?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  session: SessionPayload | null;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ErrorPageProps {
  error: string;
  message: string;
}

// Типы ошибок
export type AuthError = 
  | 'unauthorized'
  | 'auth_failed'
  | 'network_error'
  | 'expired'
  | 'already_used'
  | 'logged_out'
  | 'logout_error'
  | 'unknown_error';

// Конфигурация для различных окружений
export interface AuthConfig {
  jwtSecret: string;
  sessionDuration: number;
  cookieName: string;
  redisUrl: string;
  redisToken: string;
  isProduction: boolean;
  cookieDomain?: string;
}