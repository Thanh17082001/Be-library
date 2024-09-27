import {Body, Controller, Delete, Get, Post} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from 'src/user/dto/create-user.dto';
import {User} from 'src/user/entities/user.entity';
import {Public} from './auth.decorator';
import {ApiTags} from '@nestjs/swagger';
import {RefreshTokenDto} from 'src/token/dto/refresh-token.dto';
import {PermissonDto} from 'src/user/dto/permisson.to';
import {Action} from 'src/casl/casl.action';
import {LoginDto} from 'src/user/dto/login.dto';
import {Role} from 'src/role/role.enum';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('signup')
  async signup(@Body() user: CreateUserDto): Promise<User> {
    return await this.authService.signUp(user);
  }
  @Public()
  @Post('login')
  async login(@Body() user: LoginDto): Promise<User> {
    return await this.authService.logIn(user);
  }
  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<User> {
    return await this.authService.refreshToken(refreshTokenDto);
  }
  @Public()
  @Post('add-permisson')
  async addPermisson(@Body() permissonDto: PermissonDto): Promise<User> {
    return await this.authService.addPermisson(permissonDto);
  }

  @Public()
  @Delete('remove-permisson')
  async removePermisson(@Body() permissonDto: PermissonDto): Promise<User> {
    return await this.authService.removePermisson(permissonDto);
  }

  @Public()
  @Get('resources')
  async getResources(): Promise<string[]> {
    return await this.authService.getCollections();
  }

  // @Public()
  @Get('permissons')
  async getPermisson(): Promise<string[]> {
    return [...Object.values(Action)];
  }

  @Public()
  @Get('roles')
  async getRoles(): Promise<string[]> {
    return [...Object.values(Role)];
  }
}
