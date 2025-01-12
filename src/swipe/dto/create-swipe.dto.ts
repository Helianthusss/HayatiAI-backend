import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsIn } from 'class-validator';

export class CreateSwipeDto {
  @ApiProperty({ description: 'User ID', example: 'c1d2e3f4-uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Target ID', example: 'b1a2c3d4-uuid' })
  @IsUUID()
  targetId: string;

  @ApiProperty({ description: 'Swipe direction', example: 'right', enum: ['right', 'left'] })
  @IsString()
  @IsIn(['right', 'left'])
  direction: 'right' | 'left';
}