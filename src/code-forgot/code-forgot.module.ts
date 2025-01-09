import {Module} from '@nestjs/common';
import {CodeForgotService} from './code-forgot.service';
import {CodeForgotController} from './code-forgot.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {CodeForgot, CodeForgotSchema} from './entities/code-forgot.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: CodeForgot.name, schema: CodeForgotSchema}])],
  controllers: [CodeForgotController],
  providers: [CodeForgotService],
  exports: [CodeForgotService],
})
export class CodeForgotModule {}
