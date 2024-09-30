import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';

@Schema()
export class Example extends BaseDocument {
  @Prop({required: true})
  name: string;
  @Prop({default: ''})
  description: string;
}

export const ExampleSchema = SchemaFactory.createForClass(Example).plugin(mongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: true,
});
