import {Injectable, OnModuleInit, Logger} from '@nestjs/common';
import amqp, {ChannelWrapper} from 'amqp-connection-manager';
import {ConfirmChannel} from 'amqplib';
import {MailService} from 'src/mail/mail.service';

@Injectable()
export class ConsumerRabbitmqService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerRabbitmqService.name);
  constructor(private emailService: MailService) {
    const connection = amqp.connect(['amqp://localhost']);
    // Tạo channel wrapper để xử lý tiêu thụ tin nhắn
    this.channelWrapper = connection.createChannel({
      json: true, // Tự động xử lý JSON message
    });
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue('emailQueue', {durable: true});

        await channel.consume(
          'emailQueue',
          async message => {
            if (message) {
              const content = JSON.parse(message.content.toString());
              try {
                await this.emailService.sendEmailCampaign(content); // Đảm bảo rằng hàm này được truyền đúng tham số
                console.log('aaaaaa');
                channel.ack(message); // Xác nhận tin nhắn đã được xử lý
              } catch (error) {
                console.error('Error while sending email:', error.message);
                channel.nack(message, false, false); // Không gửi lại tin nhắn
              }
            } else {
              console.log('No message received');
            }
          },
          {noAck: false}
        );
      });
      console.log('Consumer service started and listening for messages.');
    } catch (err) {
      console.error('Error starting the consumer:', err);
    }
  }
}
