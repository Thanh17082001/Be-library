import {Test, TestingModule} from '@nestjs/testing';
import {LiquidationService} from './liquidation.service';

describe('LiquidationService', () => {
  let service: LiquidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiquidationService],
    }).compile();

    service = module.get<LiquidationService>(LiquidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
