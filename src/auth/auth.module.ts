import {CaslModule} from 'src/casl/casl.module';
import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {JwtModule} from '@nestjs/jwt';
import {jwtConstants} from './constants';
import {User} from 'src/decorators/customize.decorator';
import {UserModule} from 'src/user/user.module';
import {TokenModule} from 'src/token/token.module';

@Module({
  imports: [
    UserModule,
    TokenModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '60s'},
    }),
    CaslModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
