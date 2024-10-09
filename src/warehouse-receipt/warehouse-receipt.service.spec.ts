import {Test, TestingModule} from '@nestjs/testing';
import {WarehouseReceiptService} from './warehouse-receipt.service';

describe('WarehouseReceiptService', () => {
  let service: WarehouseReceiptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarehouseReceiptService],
    }).compile();

    service = module.get<WarehouseReceiptService>(WarehouseReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
