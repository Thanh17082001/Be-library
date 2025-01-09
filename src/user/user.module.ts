import {CaslModule} from 'src/casl/casl.module';
import {forwardRef, Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './entities/user.entity';
import {RoleModule} from 'src/role/role.module';
import {CaslGuard} from 'src/casl/casl.guard';
import {RabbitmqModule} from 'src/rabbitmq/rabbitmq.module';
import {MailModule} from 'src/mail/mail.module';
import {CodeForgotModule} from 'src/code-forgot/code-forgot.module';

@Module({
  imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}]), forwardRef(() => RoleModule), forwardRef(() => CaslModule), forwardRef(() => RabbitmqModule), CodeForgotModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
