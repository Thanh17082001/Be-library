import {BadRequestException, Injectable} from '@nestjs/common';
import {EmailDto} from './dto/create-mail.dto';
import {UpdateMailDto} from './dto/update-mail.dto';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';
import Mailgun from 'mailgun.js';
import * as FormData from 'form-data';
import createTransport from 'nodemailer';
import {MailerService} from '@nestjs-modules/mailer';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private emailClient: SibApiV3Sdk.TransactionalEmailsApi;
  constructor(
    private configService: ConfigService,
    private readonly mailerService: MailerService
  ) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    // Lấy API key từ biến môi trường (nên bảo mật API key bằng cách lưu trong file .env)
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = '';

    // Khởi tạo EmailCampaignsApi
    this.emailClient = new SibApiV3Sdk.TransactionalEmailsApi();
  }
  // public async sendMail(emailData: EmailDto) {
  //   const mailOptions = {
  //     from: `it@gdvietnam.com`,
  //     to: ['thanhdev082001@gmail.com'],
  //     subject: 'Nguyễn Thiên Thanh',
  //     html: `
  //         <h1>Xin chào!</h1>
  //         <p>Đã gửi mail cho bạn nè</p>
  //         <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
  //       `,
  //   };

  //   try {
  //     const mailGun = new Mailgun(FormData);
  //     const client = mailGun.client({
  //       username: 'api',
  //       key: this.configService.get('MAILGUN_API_KEY'),
  //     });

  //     // const response2 = await axios.post(`https://api.mailgun.net/v3/${this.configService.get('MAILGUN_DOMAIN')}/recipients`, {
  //     //   address: 'test@gmail.com'
  //     // }, {
  //     //   auth: {
  //     //     username: 'api',
  //     //     password: this.configService.get('MAILGUN_API_KEY'),
  //     //   }
  //     // });

  //     const response = await client.messages.create(this.configService.get('MAILGUN_DOMAIN'), mailOptions);

  //     console.log(`Email successfully sent to: `, mailOptions.to);
  //     return response;
  //   } catch (error) {
  //     console.error('Problem in sending email:', error);
  //     throw new BadRequestException(`Failed to send email: ${error.message || 'Unknown error'}`);
  //   }
  // }

  // async sendMailWithBrevo() {
  //   const transporter = createTransport({
  //     host: 'smtp-relay.brevo.com',
  //     port: 587,
  //     auth: {
  //       user: '7d3f7a001@smtp-brevo.com',
  //       pass: 'g3AZK1kv4QERFIDH',
  //     },
  //   });

  //   const mailOptions = {
  //     from: '7d3f7a001@smtp-brevo.com',
  //     to: 'thienthanh17082001@gmail.com',
  //     subject: `Nguyễn Thiên Thanh`,
  //     text: `Gửi mail cho bạn nè !!!!!`,
  //   };

  //   transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log('Email sent: ' + info.response);
  //     }
  //   });
  // }

  // async sendMailTest() {
  //   try {
  //     const mailOptions = {
  //       from: '7d3f7a001@smtp-brevo.com',
  //       to: 'thienthanh17082001@gmail.com',
  //       subject: `Nguyễn Thiên Thanh`,
  //       text: `Gửi mail cho bạn nè !!!!!`,
  //     };
  //     await this.mailerService.sendMail(mailOptions);
  //     console.log(`send mail successfully to ${mailOptions.to}`);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async sendEmailCampaign() {
    const email = new SibApiV3Sdk.SendSmtpEmail();
    email.sender = {name: 'GDVN', email: 'thanhdev082001@gmail.com'}; // Địa chỉ đã được xác thực
    email.to = [{email: 'thienthanh17082001@gmail.com', name: 'Recipient Name'}];
    email.subject = 'Nhắc hạn trả sách';
    email.htmlContent = '<h1>This is the HTML content of the email.</h1>'; // Nội dung HTML của email
    email.textContent = 'This is the text content of the email.'; // Nội dung văn bản của email

    try {
      const response = await this.emailClient.sendTransacEmail(email);
      console.log('Email sent successfully:');
      return response;
    } catch (error) {
      console.error('Error while sending email:', error.response ? error.response.body : error);
      throw new Error('Failed to send email');
    }
  }
}
