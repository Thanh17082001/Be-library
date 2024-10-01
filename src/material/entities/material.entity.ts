import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Material extends BaseDocument {
  @Prop({required: true})
  name: string;

  @Prop({default: ''})
  description: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material).index({name: 1});
