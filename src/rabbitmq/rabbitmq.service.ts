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
      this.consumeEmailQueue();
    } catch (error) {
      console.error(`RabbitMQ connection error: ${error}`);
    }
  }

  public async sendEmailToQueue(emailData) {
    const msg = JSON.stringify(emailData);
    this.channel.sendToQueue('emailQueue', Buffer.from(msg), {
      persistent: true,
    });
    // console.log(`Email data sent to queue: ${msg}`);

    //  await this.channel.consume('emailQueue', async msg => {
    //   if (msg) {
    //     const emailData = JSON.parse(msg.content.toString());
    //    try {
    //       await this.mailService.sendMail(emailData);
    //    } catch (error) {
    //     return 'lỗi'
    //    }
    //     this.channel.ack(msg); // Xác nhận tin nhắn đã được xử lý
    //   }
    // });
  }

  private async consumeEmailQueue() {
    await this.channel.consume('emailQueue', async msg => {
      let attempts = 0;
      if (msg) {
        const emailData = JSON.parse(msg.content.toString());
        while (attempts < 3) {
          try {
            await this.mailService.sendMail(emailData);
            this.channel.ack(msg); // Xác nhận tin nhắn đã được xử lý
            break; // Thoát khỏi vòng lặp nếu gửi thành công
          } catch (error) {
            console.error('Lỗi khi gửi email:', error.message);
            attempts++;
            if (attempts >= 3) {
              // Gửi lại vào hàng đợi lỗi nếu đã vượt quá số lần thử
              this.channel.sendToQueue('errorQueue', Buffer.from(msg.content), {
                persistent: true,
              });
              this.channel.ack(msg); // Xác nhận tin nhắn đã xử lý
            }
          }
        }
      }
    });
  }
}
