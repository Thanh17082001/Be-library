import {Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import {MailService} from './mail.service';
import {UpdateMailDto} from './dto/update-mail.dto';
import {RabbitmqService} from 'src/rabbitmq/rabbitmq.service';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly rabbitMQService: RabbitmqService
  ) {}

  @Post('send')
  async sendEmail() {
    // Gửi email vào hàng đợi
    const result = await this.rabbitMQService.sendEmailToQueue({
      to: 'recipient@example.com',
      subject: 'Hello World',
      body: 'This is a test email',
    });
    return result;
  }
}
