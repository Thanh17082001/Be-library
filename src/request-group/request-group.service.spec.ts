import {Test, TestingModule} from '@nestjs/testing';
import {RequestGroupService} from './request-group.service';

describe('RequestGroupService', () => {
  let service: RequestGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestGroupService],
    }).compile();

    service = module.get<RequestGroupService>(RequestGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
