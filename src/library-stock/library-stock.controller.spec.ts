import {Test, TestingModule} from '@nestjs/testing';
import {LibraryStockController} from './library-stock.controller';
import {LibraryStockService} from './library-stock.service';

describe('LibraryStockController', () => {
  let controller: LibraryStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryStockController],
      providers: [LibraryStockService],
    }).compile();

    controller = module.get<LibraryStockController>(LibraryStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
