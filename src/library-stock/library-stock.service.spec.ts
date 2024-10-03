import {Test, TestingModule} from '@nestjs/testing';
import {LibraryStockService} from './library-stock.service';

describe('LibraryStockService', () => {
  let service: LibraryStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibraryStockService],
    }).compile();

    service = module.get<LibraryStockService>(LibraryStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
