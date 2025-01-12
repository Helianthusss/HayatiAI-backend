import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PremiumService } from './premium.service';

@ApiTags('premium')
@Controller('premium')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @ApiOperation({ summary: 'Unlock Premium account' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @Post('unlock/:userId')
  unlockPremium(@Param('userId') userId: string) {
    return this.premiumService.unlockPremium(userId);
  }

  @ApiOperation({ summary: 'Check Premium status' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @Post('check/:userId')
  checkPremium(@Param('userId') userId: string) {
    return this.premiumService.checkPremium(userId);
  }
}
