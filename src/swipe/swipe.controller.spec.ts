import { Test, TestingModule } from '@nestjs/testing';
import { SwipeController } from './swipe.controller';

describe('SwipeController', () => {
  let controller: SwipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwipeController],
    }).compile();

    controller = module.get<SwipeController>(SwipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
