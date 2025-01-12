import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PremiumService {
  constructor(private prisma: PrismaService) {}

  async unlockPremium(userId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Premium valid for 30 days

    return this.prisma.premiumAccess.upsert({
      where: { userId },
      update: { expiresAt },
      create: { userId, expiresAt },
    });
  }

  async checkPremium(userId: string) {
    const premium = await this.prisma.premiumAccess.findUnique({ where: { userId } });
    return premium && premium.expiresAt > new Date();
  }
}