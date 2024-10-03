import {Test, TestingModule} from '@nestjs/testing';
import {LiquidationController} from './liquidation.controller';
import {LiquidationService} from './liquidation.service';

describe('LiquidationController', () => {
  let controller: LiquidationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiquidationController],
      providers: [LiquidationService],
    }).compile();

    controller = module.get<LiquidationController>(LiquidationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
