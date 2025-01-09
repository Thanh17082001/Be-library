import {forwardRef, Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {MailController} from './mail.controller';
import {RabbitmqModule} from 'src/rabbitmq/rabbitmq.module';
import {UserModule} from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => RabbitmqModule)],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
