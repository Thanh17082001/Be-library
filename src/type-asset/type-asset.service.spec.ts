import {Test, TestingModule} from '@nestjs/testing';
import {TypeAssetService} from './type-asset.service';

describe('TypeAssetService', () => {
  let service: TypeAssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeAssetService],
    }).compile();

    service = module.get<TypeAssetService>(TypeAssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
