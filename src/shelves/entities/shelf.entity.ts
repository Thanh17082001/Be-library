import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {OmitType} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Shelves extends BaseDocument {
  @Prop({required: true})
  name: string;
  @Prop({required: true, ref: 'Asset'})
  assetId: Types.ObjectId;
  @Prop({default: ''})
  description: string;
}

export const ShelvesSchema = SchemaFactory.createForClass(Shelves).remove(['isPublic', 'isLink']).index({name: 1});
