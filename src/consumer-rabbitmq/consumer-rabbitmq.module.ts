import {Module} from '@nestjs/common';
import {ConsumerRabbitmqService} from './consumer-rabbitmq.service';
import {ConsumerRabbitmqController} from './consumer-rabbitmq.controller';
import {MailModule} from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ConsumerRabbitmqController],
  providers: [ConsumerRabbitmqService],
})
export class ConsumerRabbitmqModule {}
