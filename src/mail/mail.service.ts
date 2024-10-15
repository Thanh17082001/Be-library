import {BadRequestException, Injectable} from '@nestjs/common';
import {EmailDto} from './dto/create-mail.dto';
import {UpdateMailDto} from './dto/update-mail.dto';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';
import Mailgun from 'mailgun.js';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}
  public async sendMail(emailData:EmailDto) {
    const mailOptions = {
      from: `it@gdvietnam.com`,
      to: ['thanhdev082001@gmail.com'],
      subject: 'Nguyễn Thiên Thanh',
      html: `
          <h1>Xin chào!</h1>
          <p>Đã gửi mail cho bạn nè</p>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        `,
    };

    try {
      const mailGun = new Mailgun(FormData);
      const client = mailGun.client({
        username: 'api',
        key: this.configService.get('MAILGUN_API_KEY'),
      });

      // const response2 = await axios.post(`https://api.mailgun.net/v3/${this.configService.get('MAILGUN_DOMAIN')}/recipients`, {
      //   address: 'test@gmail.com'
      // }, {
      //   auth: {
      //     username: 'api',
      //     password: this.configService.get('MAILGUN_API_KEY'),
      //   }
      // });

      const response = await client.messages.create(this.configService.get('MAILGUN_DOMAIN'), mailOptions);

      console.log(`Email successfully sent to: `, mailOptions.to);
      return response;
    } catch (error) {
      console.error('Problem in sending email:', error);
      throw new BadRequestException(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }
}
