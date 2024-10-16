import {Module} from '@nestjs/common';
import {TypeVoiceService} from './type-voice.service';
import {TypeVoiceController} from './type-voice.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {TypeVoice, TypeVoiceSchema} from './entities/type-voice.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: TypeVoice.name, schema: TypeVoiceSchema}]), CaslModule],
  controllers: [TypeVoiceController],
  providers: [TypeVoiceService],
})
export class TypeVoiceModule {}
