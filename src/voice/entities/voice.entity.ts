import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';
import {TypeVoice} from 'src/type-voice/entities/type-voice.entity';

@Schema()
export class Voice extends BaseDocument {
  @Prop({required: true, ref: 'Publication'})
  publicationId: Types.ObjectId;
  @Prop({ref: TypeVoice.name})
  typeVoiceId: Types.ObjectId;
  @Prop()
  path: string;
  @Prop()
  isPrivate: boolean;
  @Prop()
  order: number;
  @Prop()
  name: string;
}

export const VoiceSchema = SchemaFactory.createForClass(Voice)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .index({name: 1});
