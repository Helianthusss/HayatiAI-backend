import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google OAuth access token',
    example: 'ya29.a0AfB_byC3...'
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class TelegramAuthDto {
  @ApiProperty({
    description: 'Telegram user ID',
    example: 12345678
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false
  })
  @IsString()
  last_name?: string;
}

export class WhatsAppAuthDto {
  @ApiProperty({
    description: 'WhatsApp phone number',
    example: '+84123456789'
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class InitiateWhatsAppLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}