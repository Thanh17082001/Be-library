import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ExampleModule } from './example/example.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { RoleModule } from './role/role.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { TokenModule } from './token/token.module';
import { LibraryModule } from './library/library.module';
import { GroupModule } from './group/group.module';
import { MaterialModule } from './material/material.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      // envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      isGlobal: true,
    }),
    ExampleModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    CaslModule,
    RoleModule,
    TokenModule,
    LibraryModule,
    GroupModule,
    MaterialModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD, // Đăng ký AuthGuard cho tất cả các route
    useClass: AuthGuard,
  },],
})
export class AppModule {
 
}
