import {Module} from '@nestjs/common';
import {VoiceService} from './voice.service';
import {VoiceController} from './voice.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Voice, VoiceSchema} from './entities/voice.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Voice.name, schema: VoiceSchema}]), CaslModule],
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}
