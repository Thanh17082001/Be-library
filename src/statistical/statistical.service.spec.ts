import {Test, TestingModule} from '@nestjs/testing';
import {StatisticalService} from './statistical.service';

describe('StatisticalService', () => {
  let service: StatisticalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatisticalService],
    }).compile();

    service = module.get<StatisticalService>(StatisticalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
