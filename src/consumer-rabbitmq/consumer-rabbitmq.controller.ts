import {Controller} from '@nestjs/common';
import {ConsumerRabbitmqService} from './consumer-rabbitmq.service';

@Controller()
export class ConsumerRabbitmqController {
  constructor(private readonly consumerRabbitmqService: ConsumerRabbitmqService) {}
}
