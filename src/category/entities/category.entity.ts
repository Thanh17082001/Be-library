import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Category extends BaseDocument {
  @Prop({required: true})
  name: string;
  @Prop({default: ''})
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category).index({name: 1});
