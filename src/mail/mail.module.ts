import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {MailController} from './mail.controller';
import {RabbitmqModule} from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
