import {Module} from '@nestjs/common';
import {PublisherService} from './publisher.service';
import {PublisherController} from './publisher.controller';
import {Mongoose} from 'mongoose';
import {MongooseModule} from '@nestjs/mongoose';
import {Publisher, PublisherSchema} from './entities/publisher.entity';
import {CaslModule} from 'src/casl/casl.module';
import {GroupModule} from 'src/group/group.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Publisher.name, schema: PublisherSchema}]), CaslModule, GroupModule],
  controllers: [PublisherController],
  providers: [PublisherService],
  exports: [PublisherService, MongooseModule],
})
export class PublisherModule {}
