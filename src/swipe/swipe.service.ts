import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SwipeService {
  constructor(private prisma: PrismaService) {}

  async createSwipe(userId: string, targetId: string, direction: 'right' | 'left') {
    if (userId === targetId) {
      throw new BadRequestException('You cannot swipe yourself.');
    }

    return this.prisma.swipe.create({
      data: { userId, targetId, direction },
    });
  }

  async checkForMatch(userId: string, targetId: string) {
    return this.prisma.swipe.findFirst({
      where: { userId: targetId, targetId: userId, direction: 'right' },
    });
  }

  async createMatch(userId: string, targetId: string) {
    return this.prisma.match.create({
      data: { user1Id: userId, user2Id: targetId },
    });
  }

  async handleSwipe(userId: string, targetId: string, direction: 'right' | 'left') {
    await this.createSwipe(userId, targetId, direction);

    if (direction === 'right') {
      const mutualSwipe = await this.checkForMatch(userId, targetId);

      if (mutualSwipe) {
        return this.createMatch(userId, targetId);
      }
    }
    return { success: true, message: 'Swipe successful!' };
  }
}