import {forwardRef, Module} from '@nestjs/common';
import {RabbitmqService} from './rabbitmq.service';
import {RabbitmqController} from './rabbitmq.controller';
import {MailModule} from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => MailModule), forwardRef(() => UserModule)],
  controllers: [RabbitmqController],
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
