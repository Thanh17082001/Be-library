import {Test, TestingModule} from '@nestjs/testing';
import {LoanshipController} from './loanship.controller';
import {LoanshipService} from './loanship.service';

describe('LoanshipController', () => {
  let controller: LoanshipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanshipController],
      providers: [LoanshipService],
    }).compile();

    controller = module.get<LoanshipController>(LoanshipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
