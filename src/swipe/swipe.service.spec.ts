import { Test, TestingModule } from '@nestjs/testing';
import { SwipeService } from './swipe.service';

describe('SwipeService', () => {
  let service: SwipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwipeService],
    }).compile();

    service = module.get<SwipeService>(SwipeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
