import {Test, TestingModule} from '@nestjs/testing';
import {RequestGroupController} from './request-group.controller';
import {RequestGroupService} from './request-group.service';

describe('RequestGroupController', () => {
  let controller: RequestGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestGroupController],
      providers: [RequestGroupService],
    }).compile();

    controller = module.get<RequestGroupController>(RequestGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
