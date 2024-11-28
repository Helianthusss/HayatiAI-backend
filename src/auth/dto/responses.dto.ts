import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logged out successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    example: 'uuid-string',
    description: 'The ID of the revoked session'
  })
  sessionId: string;
}

export class ChangePasswordResponseDto {
  @ApiProperty({
    example: 'Password changed successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    example: 'jwt-token-string',
    description: 'New access token'
  })
  accessToken: string;

  @ApiProperty({
    example: 'jwt-token-string',
    description: 'New refresh token'
  })
  refreshToken: string;

  @ApiProperty({
    example: 'uuid-string',
    description: 'New session ID'
  })
  sessionId: string;
}