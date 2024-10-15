import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {MailController} from './mail.controller';
import {RabbitmqModule} from 'src/rabbitmq/rabbitmq.module';
import * as nodemailer from 'nodemailer';
import {MailerModule, MailerService} from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: nodemailer.createTransport({
          host: 'smtp-relay.brevo.com', // Máy chủ SMTP của Brevo
          port: 587, // Port SMTP
          secure: false, // false nếu không dùng SSL/TLS
          auth: {
            user: '', // Email Brevo của bạn
            pass: '', // API key của Brevo
          },
        }),
        defaults: {
          from: '"No Reply" <no-reply@example.com>',
        },
      }),
    }),
    RabbitmqModule,
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
