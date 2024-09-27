import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {OmitType} from '@nestjs/swagger';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Shelves extends BaseDocument {
  @Prop({required: true})
  name: string;
  @Prop({default: ''})
  description: string;
}

export const ShelvesSchema = SchemaFactory.createForClass(Shelves);
