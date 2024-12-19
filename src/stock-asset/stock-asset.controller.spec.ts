import {Test, TestingModule} from '@nestjs/testing';
import {StockAssetController} from './stock-asset.controller';
import {StockAssetService} from './stock-asset.service';

describe('StockAssetController', () => {
  let controller: StockAssetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockAssetController],
      providers: [StockAssetService],
    }).compile();

    controller = module.get<StockAssetController>(StockAssetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
