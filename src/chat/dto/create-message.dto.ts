import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Sender ID', example: 'c1d2e3f4-uuid' })
  @IsUUID()
  senderId: string;

  @ApiProperty({ description: 'Receiver ID', example: 'b1a2c3d4-uuid' })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ description: 'Message content', example: 'Hello!' })
  @IsString()
  @Length(1, 255)
  message: string;
}