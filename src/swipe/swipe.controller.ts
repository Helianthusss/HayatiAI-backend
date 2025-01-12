import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SwipeService } from './swipe.service';
import { CreateSwipeDto } from './dto/create-swipe.dto';

@ApiTags('swipes')
@Controller('swipes')
export class SwipeController {
  constructor(private readonly swipeService: SwipeService) {}

  @ApiOperation({ summary: 'Swipe left/right between users' })
  @Post()
  async swipe(@Body() createSwipeDto: CreateSwipeDto) {
    const { userId, targetId, direction } = createSwipeDto;
    return this.swipeService.handleSwipe(userId, targetId, direction);
  }
}