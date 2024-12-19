import {Test, TestingModule} from '@nestjs/testing';
import {TypeAssetController} from './type-asset.controller';
import {TypeAssetService} from './type-asset.service';

describe('TypeAssetController', () => {
  let controller: TypeAssetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeAssetController],
      providers: [TypeAssetService],
    }).compile();

    controller = module.get<TypeAssetController>(TypeAssetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
