import {Test, TestingModule} from '@nestjs/testing';
import {LoanshipService} from './loanship.service';

describe('LoanshipService', () => {
  let service: LoanshipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanshipService],
    }).compile();

    service = module.get<LoanshipService>(LoanshipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
