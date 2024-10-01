import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';

@Schema()
export class Asset extends BaseDocument {
  @Prop({required: true})
  name: string;
  @Prop({default: 0})
  quantity: number;
  @Prop({default: ''})
  description: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .index({name: 1});
