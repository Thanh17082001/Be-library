import {Test, TestingModule} from '@nestjs/testing';
import {WarehouseReceiptController} from './warehouse-receipt.controller';
import {WarehouseReceiptService} from './warehouse-receipt.service';

describe('WarehouseReceiptController', () => {
  let controller: WarehouseReceiptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseReceiptController],
      providers: [WarehouseReceiptService],
    }).compile();

    controller = module.get<WarehouseReceiptController>(WarehouseReceiptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
