import { Module } from '@nestjs/common';
import { PremiumController } from './premium.controller';
import { PremiumService } from './premium.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PremiumController],
  providers: [PremiumService, PrismaService],
})
export class PremiumModule {}
