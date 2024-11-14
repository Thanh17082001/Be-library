import {PartialType} from '@nestjs/swagger';
import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, Model, ObjectId, Types} from 'mongoose';
import {CreateUserDto} from 'src/user/dto/create-user.dto';
import {User} from 'src/user/entities/user.entity';
import {UserService} from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {TokenService} from 'src/token/token.service';
import {RefreshTokenDto} from 'src/token/dto/refresh-token.dto';

import {Cron} from '@nestjs/schedule';
import {PermissonDto} from 'src/user/dto/permission.dto';
import {LoginDto} from 'src/user/dto/login.dto';
import {SignUpDto} from 'src/user/dto/sign-up.dto';
import {UpdateUserDto} from 'src/user/dto/update-user.dto';
import {UpdateAuthDto} from 'src/user/dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private tokenService: TokenService,
    private jwtService: JwtService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async signUp(data: SignUpDto): Promise<User> {
    data.username = '';
    data.avatar = '';
    data.class = '';
    data.school = '';
    const newUser = await this.usersService.create({...data, barcode: ''});
    return newUser;
  }

  async update(id: string, data: UpdateAuthDto): Promise<User> {
    return await this.usersService.updateAuth(id, data);
  }

  async logIn(data: LoginDto): Promise<any> {
    const user = await this.usersService.findOne({username: data.username, isActive: true});
    if (!user) {
      throw new NotFoundException('Account or password is incorrect');
    }
    const isPass = await bcrypt.compare(data.password, user.password);
    if (!isPass) {
      throw new BadRequestException('Account or password is incorrect');
    }
    const payload = {...user, password: undefined, passWordFirst: undefined, libraryDetail: user.libraryId, libraryId: user.libraryId._id};
    const accessToken = this.jwtService.sign(payload, {expiresIn: '60m'});
    const refreshToken = this.jwtService.sign({userId: user._id}, {expiresIn: '7d'});
    await this.tokenService.create({
      userId: new Types.ObjectId(user._id.toString()),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return {
      ...payload,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
    const token = await this.tokenService.findOne({
      refreshToken: refreshTokenDto.refreshToken,
    });
    if (!token || new Date() > token.expiresAt) {
      throw new BadRequestException('Refresh token is valid or not exist');
    }

    await this.tokenService.remove({_id: token._id});

    // Tạo access token mới
    const user = await this.usersService.findOne({_id: token.userId});
    const payload = {...user, password: undefined, passWordFirst: undefined, libraryDetail: user.libraryId, libraryId: user.libraryId._id};
    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '20s',
    });

    const refreshToken = this.jwtService.sign({userId: user._id}, {expiresIn: '7d'});
    await this.tokenService.create({
      userId: new Types.ObjectId(user._id.toString()),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {...payload, accessToken: newAccessToken, refreshToken};
  }

  @Cron('0 0 * * *') // Chạy mỗi ngày lúc 00:00
  async cleanExpiredTokens() {
    const result = await this.tokenService.remove({
      createdAt: {$lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}, // Thay đổi thời gian theo yêu cầu
    });
    console.log(`Deleted ${result} expired tokens.`);
  }

  async addPermisson(permissionDto: PermissonDto): Promise<User> {
    return await this.usersService.addPermisson(permissionDto);
  }

  async removePermisson(permissionDto: PermissonDto): Promise<User> {
    return await this.usersService.removePermisson(permissionDto);
  }

  async getCollections(): Promise<string[]> {
    const collections = await this.connection.db.listCollections().toArray();
    return collections.map(collection => collection.name);
  }
}
