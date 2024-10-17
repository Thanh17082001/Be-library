import {Test, TestingModule} from '@nestjs/testing';
import {ConsumerRabbitmqService} from './consumer-rabbitmq.service';

describe('ConsumerRabbitmqService', () => {
  let service: ConsumerRabbitmqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsumerRabbitmqService],
    }).compile();

    service = module.get<ConsumerRabbitmqService>(ConsumerRabbitmqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
