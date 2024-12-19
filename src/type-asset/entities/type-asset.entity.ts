import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';

@Schema()
export class TypeAsset extends BaseDocument {
  @Prop({required: true})
  name: string;
}

export const TypeAssetSchema = SchemaFactory.createForClass(TypeAsset)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['libraryId, isPublic', 'isLink'])
  .index({name: 1});
