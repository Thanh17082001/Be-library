import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {ExampleModule} from './example/example.module';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {CaslModule} from './casl/casl.module';
import {RoleModule} from './role/role.module';
import {APP_GUARD} from '@nestjs/core';
import {AuthGuard} from './auth/auth.guard';
import {TokenModule} from './token/token.module';
import {LibraryModule} from './library/library.module';
import {GroupModule} from './group/group.module';
import {MaterialModule} from './material/material.module';
import {CategoryModule} from './category/category.module';
import {ShelvesModule} from './shelves/shelves.module';
import {PublisherModule} from './publisher/publisher.module';
import {AuthorModule} from './author/author.module';
import {PublicationModule} from './publication/publication.module';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import {LoanshipModule} from './loanship/loanship.module';
import {AssetModule} from './asset/asset.module';
import {LibraryStockModule} from './library-stock/library-stock.module';
import {LiquidationModule} from './liquidation/liquidation.module';
import * as mongoose from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      // envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');

        // Đăng ký plugin mongoose-delete toàn cục
        mongoose.plugin(mongooseDelete, {deletedAt: true, overrideMethods: 'all', deleteBy: true});

        return {
          uri, // URI kết nối đến MongoDB
        };
      },
      inject: [ConfigService],
    }),
    ExampleModule,
    UserModule,
    AuthModule,
    RoleModule,
    TokenModule,
    LibraryModule,
    GroupModule,
    MaterialModule,
    CategoryModule,
    ShelvesModule,
    PublisherModule,
    AuthorModule,
    PublicationModule,
    LoanshipModule,
    AssetModule,
    LibraryStockModule,
    LiquidationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // Đăng ký AuthGuard cho tất cả các route
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
