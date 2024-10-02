import {forwardRef, Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './entities/user.entity';
import {RoleModule} from 'src/role/role.module';
import {CaslGuard} from 'src/casl/casl.guard';

@Module({
  imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}]), forwardRef(() => RoleModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
