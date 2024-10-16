import {Injectable, OnModuleInit} from '@nestjs/common';
import {Channel, Connection, connect} from 'amqplib';
import {MailService} from 'src/mail/mail.service';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection: Connection;
  public channel: Channel;

  constructor(private readonly mailService: MailService) {
    // this.init();
  }
  async onModuleInit() {
    await this.init(); // Khởi tạo kết nối RabbitMQ và gọi consume ngay sau đó
  }

  private async init() {
    try {
      this.connection = await connect('amqp://localhost');
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue('emailQueue', {durable: true});
      console.log('RabbitMQ connected successfully!');
      await this.consumeEmailQueue();
    } catch (error) {
      console.error(`RabbitMQ connection error: ${error}`);
    }
  }

  public async sendEmailToQueue(emailData) {
    if (!this.channel) {
      console.error('Channel is not available to send emails');
      return;
    }
    const msg = JSON.stringify(emailData);
    await this.channel.sendToQueue('emailQueue', Buffer.from(msg), {
      persistent: true,
    });
    console.log(`Email data sent to queue: chờ xử lý`);
  }

  private async consumeEmailQueue() {
    if (!this.channel) {
      console.error('Channel is not available for consuming emails');
      return;
    }
    console.log('Starting to consume email queue...');

    // Bắt đầu tiêu thụ từ hàng đợi emailQueue
    await this.channel.consume(
      'emailQueue',
      async msg => {
        if (msg) {
          console.log('Message received from queue:', msg.content.toString()); // Thêm log khi nhận được tin nhắn
          const emailData = JSON.parse(msg.content.toString());

          try {
            await this.mailService.sendEmailCampaign(); // Truyền emailData vào hàm
            console.log(`Email sent successfully to ${emailData.to}`);
            this.channel.ack(msg); // Xác nhận tin nhắn đã được xử lý
          } catch (error) {
            console.error('Error while sending email:', error.message);
            this.channel.nack(msg, false, false); // Không gửi lại message
          }
        } else {
          console.log('No message received from queue');
        }
      },
      {
        noAck: false, // Đảm bảo xác nhận tin nhắn sau khi xử lý
      }
    );
  }
}
