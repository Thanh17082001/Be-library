import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';

@Schema()
export class TypeVoice extends BaseDocument {
  @Prop({required: true})
  name: string;
}

export const TypeVoiceSchema = SchemaFactory.createForClass(TypeVoice)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic', 'isLink', 'note'])
  .index({name: 1});
