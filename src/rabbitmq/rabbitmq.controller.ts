import {Controller, Get} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';
import {RabbitmqService} from './rabbitmq.service';
import {CreateRabbitmqDto} from './dto/create-rabbitmq.dto';
import {UpdateRabbitmqDto} from './dto/update-rabbitmq.dto';

@Controller()
export class RabbitmqController {
  constructor(private readonly rabbitMQService: RabbitmqService) {}

  // @Get('send')
  // async sendMessage() {
  //   const message = { text: 'Hello, RabbitMQ!' };
  //   return await this.rabbitMQService.sendMessage('message_queue', message);
  // }

  // @Get('emit')
  // async emitMessage() {
  //   const event = { event: 'user_created', data: { userId: 1 } };
  //   return await this.rabbitMQService.emitMessage('event_queue', event);
  // }
}
