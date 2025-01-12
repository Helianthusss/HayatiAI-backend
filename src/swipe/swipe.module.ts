import { Module } from '@nestjs/common';
import { SwipeController } from './swipe.controller';
import { SwipeService } from './swipe.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SwipeController],
  providers: [SwipeService, PrismaService],
})
export class SwipeModule {}
