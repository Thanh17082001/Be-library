import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailService } from './mail.service';
import { UpdateMailDto } from './dto/update-mail.dto';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/auth.decorator';
import { EmailDto } from './dto/create-mail.dto';

@Controller('mail')
@ApiTags('mail')
export class MailController {
  constructor(private readonly rabbitMQService: RabbitmqService) { }
  @Public()
  @Post('send')
  async sendEmail(@Body() emailDto: EmailDto) {
    // Gửi email vào hàng đợi



    const htmlContent =
      `
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <header style="background-color: #4CAF50; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Đặt lại mật khẩu</h1>
        </header>
        <div style="padding: 20px;">
          <p>Kính gửi <strong>[Tên người nhận]</strong>,</p>
          <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>[Username]</strong> của bạn. Để tiếp tục, Sử dụng mã bảo mật của bạn:</p>
          <p style="text-align: center;">
            <span style="display: inline-block; color: red; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 20px; letter-spacing: 3px;">[123456]</a>
          </p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn sẽ vẫn an toàn.</p>
          <p>Trân trọng,</p>
        </div>
        <footer style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 12px; color: #666;">
          <p>© 2025 Công ty cổ phần giải pháp công nghệ GDVN. All rights reserved.</p>
        </footer>
      </div>
    </body>
    `;
    emailDto.body=htmlContent;
    const result = await this.rabbitMQService.sendEmailToQueue(emailDto);
    return result;
  }
}
