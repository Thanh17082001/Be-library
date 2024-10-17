import {Test, TestingModule} from '@nestjs/testing';
import {ConsumerRabbitmqController} from './consumer-rabbitmq.controller';
import {ConsumerRabbitmqService} from './consumer-rabbitmq.service';

describe('ConsumerRabbitmqController', () => {
  let controller: ConsumerRabbitmqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumerRabbitmqController],
      providers: [ConsumerRabbitmqService],
    }).compile();

    controller = module.get<ConsumerRabbitmqController>(ConsumerRabbitmqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
