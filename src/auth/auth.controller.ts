import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
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
import {CheckPolicies} from 'src/casl/check-policies.decorator';
import {CaslGuard} from 'src/casl/casl.guard';
import {AppAbility} from 'src/casl/casl-ability.factory/casl-ability.factory';
import {Types} from 'mongoose';
import {UpdateAuthDto} from 'src/user/dto/update-auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'auths')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async signup(@Body() signupDto: SignUpDto, @Req() request: Request): Promise<User> {
    const user = request['user'] ?? null;
    signupDto.createBy = new Types.ObjectId(user?._id) ?? null;
    return await this.authService.signUp(signupDto);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'auths')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async update(@Param('id') id: string, @Body() signupDto: UpdateAuthDto, @Req() request: Request): Promise<User> {
    return await this.authService.update(id, signupDto);
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
    const resources = await this.authService.getCollections();
    return [...resources, 'statisticals'];
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
