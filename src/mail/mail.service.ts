import {BadRequestException, Injectable} from '@nestjs/common';
import {EmailDto} from './dto/create-mail.dto';
import {UpdateMailDto} from './dto/update-mail.dto';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';
import Mailgun from 'mailgun.js';
import * as FormData from 'form-data';
import createTransport from 'nodemailer';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private emailClient: SibApiV3Sdk.TransactionalEmailsApi;
  constructor(private configService: ConfigService) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    // Lấy API key từ biến môi trường (nên bảo mật API key bằng cách lưu trong file .env)
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = this.configService.get('BREVO_API_KEY');

    // Khởi tạo EmailCampaignsApi
    this.emailClient = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendEmailCampaign(emaiDto?: EmailDto) {
    const emails = emaiDto.emails.map(email => {
      if (!Object.keys(email).includes('email')) {
        return { email: email };
      }
    });
    const email = new SibApiV3Sdk.SendSmtpEmail();
    email.sender = emaiDto.sender ?? { name: 'Hệ thống liên thông thư viện GDVN', email: 'thanhdev082001@gmail.com'}; // Địa chỉ đã được xác thực
    email.to = emails;
    email.subject = emaiDto.subject ?? 'Hệ thống liên thông thư viện GDVN';
    email.htmlContent = emaiDto.body ; // Nội dung HTML của email

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
