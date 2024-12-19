import {Test, TestingModule} from '@nestjs/testing';
import {StockAssetService} from './stock-asset.service';

describe('StockAssetService', () => {
  let service: StockAssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockAssetService],
    }).compile();

    service = module.get<StockAssetService>(StockAssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
