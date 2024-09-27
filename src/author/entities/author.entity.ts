import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Author extends BaseDocument {
  @Prop({required: true})
  name: string;
  @Prop({default: ''})
  description: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
