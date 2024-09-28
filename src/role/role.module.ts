import {Module} from '@nestjs/common';
import {RoleService} from './role.service';
import {RoleController} from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/casl/casl.module';
import { RoleS, RoleSchema } from './entities/role.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: RoleS.name, schema: RoleSchema }]), CaslModule, UserModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
