import { PartialType } from '@nestjs/swagger';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/token/token.service';
import { RefreshTokenDto } from 'src/token/dto/refresh-token.dto';

import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuthService {
    constructor(private usersService: UserService, private tokenService: TokenService, private jwtService: JwtService) { }
    async signUp(data: CreateUserDto): Promise<User> {
        const password = await bcrypt.hash(data.password, 10)
        const user: CreateUserDto = {
            password: password,
            email: data.email,
        }
        
        const newUser = await this.usersService.create(user);
        return newUser;
    }

    async logIn(data: CreateUserDto): Promise<any>{
        const user = await this.usersService.findOne({ email: data.email });
        if (!user) {
            throw new NotFoundException('Account or password is incorrect');
        }
        const isPass = await bcrypt.compare(data.password, user.password);
        if (!isPass) {
            throw new BadRequestException('Account or password is incorrect');
        }
        const payload = { ...user, password: undefined };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '60s' });
        const refreshToken = this.jwtService.sign({ userId: user._id }, { expiresIn: '7d' });
        await this.tokenService.create({
            userId: new Types.ObjectId(user._id.toString()),
            refreshToken: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        return {
            ...payload,
            accessToken: accessToken,
            refreshToken: refreshToken
        } ;
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
        const token = await this.tokenService.findOne({ refreshToken: refreshTokenDto.refreshToken });
        if (!token || new Date() > token.expiresAt) {
            throw new BadRequestException('Refresh token không hợp lệ hoặc đã hết hạn');
        }

        // Tạo access token mới
        const user = await this.usersService.findOne({ _id: token.userId });
        const payload = { ...user, password: undefined };
        const newAccessToken = await this.jwtService.signAsync(payload);

        return { ...payload,accessToken: newAccessToken };
    }

    @Cron('0 0 * * *') // Chạy mỗi ngày lúc 00:00
    async cleanExpiredTokens() {
        const result = await this.tokenService.remove({
            createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Thay đổi thời gian theo yêu cầu
        });
        console.log(`Deleted ${result} expired tokens.`);
    }
}
