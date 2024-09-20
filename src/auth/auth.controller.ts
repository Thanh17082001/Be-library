import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { Public } from './auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from 'src/token/dto/refresh-token.dto';

@Controller('auth')
@ApiTags('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  @Post('signup')
  async signup(@Body() user: CreateUserDto): Promise<User>{
    return await this.authService.signUp(user);
  }

  @Post('login')
  async login(@Body() user: CreateUserDto): Promise<User> {
    return await this.authService.logIn(user);
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<User> {
    return await this.authService.refreshToken(refreshTokenDto);
  }
}
