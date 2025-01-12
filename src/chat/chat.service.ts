import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, receiverId: string, message: string) {
    const messageCount = await this.prisma.chat.count({
      where: { senderId, receiverId },
    });

    const hasPremium = await this.prisma.premiumAccess.findUnique({
      where: { userId: senderId },
    });

    if (messageCount >= 10 && (!hasPremium || hasPremium.expiresAt < new Date())) {
      throw new BadRequestException('You have used up your 10 free messages. Please upgrade to Premium.');
    }

    return this.prisma.chat.create({
      data: { senderId, receiverId, message },
    });
  }

  async getMessages(userId: string, targetId: string) {
    return this.prisma.chat.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: targetId },
          { senderId: targetId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}