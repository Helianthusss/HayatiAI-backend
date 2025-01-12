import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Send message' })
  @ApiBody({ description: 'Message information', type: CreateMessageDto })
  @Post('send')
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.chatService.sendMessage(
      createMessageDto.senderId,
      createMessageDto.receiverId,
      createMessageDto.message,
    );
  }

  @ApiOperation({ summary: 'Get message history' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'targetId', description: 'Target ID' })
  @Get(':userId/:targetId')
  async getMessages(@Param('userId') userId: string, @Param('targetId') targetId: string) {
    return this.chatService.getMessages(userId, targetId);
  }
}