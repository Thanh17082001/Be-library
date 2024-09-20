import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from './entities/token.entity';

@Module({
  imports:[MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }])],
  controllers: [TokenController],
  providers: [TokenService],
  exports:[TokenService, MongooseModule]
})
export class TokenModule {}
