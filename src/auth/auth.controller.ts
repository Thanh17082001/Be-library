import {Body, Controller, Delete, Get, Post, Req} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from 'src/user/dto/create-user.dto';
import {User} from 'src/user/entities/user.entity';
import {Public} from './auth.decorator';
import {ApiTags} from '@nestjs/swagger';
import {RefreshTokenDto} from 'src/token/dto/refresh-token.dto';
import {PermissonDto} from 'src/user/dto/permission.dto';
import {Action} from 'src/casl/casl.action';
import {LoginDto} from 'src/user/dto/login.dto';
import {Role} from 'src/role/role.enum';
import {SignUpDto} from 'src/user/dto/sign-up.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() signupDto: SignUpDto, @Req() request: Request): Promise<User> {
    const user = request['user'] ?? null;
    signupDto.createBy = user?.userId ?? null;
    return await this.authService.signUp(signupDto);
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
  @Post('add-permission')
  async addPermisson(@Body() permissionDto: PermissonDto): Promise<User> {
    return await this.authService.addPermisson(permissionDto);
  }

  @Public()
  @Delete('remove-permission')
  async removePermisson(@Body() permissionDto: PermissonDto): Promise<User> {
    return await this.authService.removePermisson(permissionDto);
  }

  @Public()
  @Get('resources')
  async getResources(): Promise<string[]> {
    return await this.authService.getCollections();
  }

  // @Public()
  @Get('permissions')
  async getPermisson(): Promise<string[]> {
    return [...Object.values(Action)];
  }

  @Public()
  @Get('roles')
  async getRoles(): Promise<string[]> {
    return [...Object.values(Role)];
  }
}
