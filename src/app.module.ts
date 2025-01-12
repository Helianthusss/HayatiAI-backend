import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { SwipeModule } from './swipe/swipe.module';
import { ChatModule } from './chat/chat.module';
import { PremiumModule } from './premium/premium.module';
//import { PaymentModule } from './payment/payment.module';


@Module({
  imports: [AuthModule, PrismaModule, SwipeModule, ChatModule, PremiumModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
