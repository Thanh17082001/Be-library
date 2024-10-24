import {Module} from '@nestjs/common';
import {VoiceService} from './voice.service';
import {VoiceController} from './voice.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Voice, VoiceSchema} from './entities/voice.entity';
import {CaslModule} from 'src/casl/casl.module';
import {GroupModule} from 'src/group/group.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Voice.name, schema: VoiceSchema}]), CaslModule, GroupModule],
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}
