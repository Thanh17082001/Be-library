import {Module} from '@nestjs/common';
import {RequestGroupService} from './request-group.service';
import {RequestGroupController} from './request-group.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {RequestGroup, RequestGroupSchema} from './entities/request-group.entity';
import {CaslModule} from 'src/casl/casl.module';
import {GroupModule} from 'src/group/group.module';
import {LibraryModule} from 'src/library/library.module';

@Module({
  imports: [MongooseModule.forFeature([{name: RequestGroup.name, schema: RequestGroupSchema}]), CaslModule, GroupModule, LibraryModule],
  controllers: [RequestGroupController],
  providers: [RequestGroupService],
})
export class RequestGroupModule {}
