import {Module} from '@nestjs/common';
import {GroupService} from './group.service';
import {GroupController} from './group.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Group, GroupSchema} from './entities/group.entity';
import {CaslModule} from 'src/casl/casl.module';
import {LibraryModule} from 'src/library/library.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Group.name, schema: GroupSchema}]), CaslModule, LibraryModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
