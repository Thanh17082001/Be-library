import {Injectable} from '@nestjs/common';
import {Channel, Connection, connect} from 'amqplib';
import {MailService} from 'src/mail/mail.service';

@Injectable()
export class RabbitmqService {
  private connection: Connection;
  public channel: Channel;

  constructor(private readonly mailService: MailService) {
    this.init();
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
    const msg = JSON.stringify(emailData);
    await this.channel.sendToQueue('emailQueue', Buffer.from(msg), {
      persistent: true,
    });
    console.log(`Email data sent to queue: chờ xử lý`);
  }

  private async consumeEmailQueue() {
    console.log('Chạy đến đây');
    await this.channel.consume('emailQueue', async msg => {
      if (msg) {
        const emailData = JSON.parse(msg.content.toString());
        try {
          await this.mailService.sendEmailCampaign(); // Truyền emailData vào hàm
          console.log(`Email sent successfully to ${emailData.to}`);
          this.channel.ack(msg); // Xác nhận tin nhắn đã được xử lý
        } catch (error) {
          console.error('Error while sending email:', error.message);
          this.channel.nack(msg, false, false); // Không xác nhận và không gửi lại
        }
      }
    });
  }
}
