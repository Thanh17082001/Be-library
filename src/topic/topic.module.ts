import {Module} from '@nestjs/common';
import {TopicService} from './topic.service';
import {TopicController} from './topic.controller';
import { Mongoose } from 'mongoose';
import { Topic, TopicSchema } from './entities/topic.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),CaslModule],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
