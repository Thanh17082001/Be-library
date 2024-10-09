import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';

@Schema()
export class LibraryStock extends BaseDocument {
  @Prop({required: true, ref: 'Publication'})
  publicationId: Types.ObjectId;

  @Prop({required: true, ref: 'Shelves'})
  shelvesId: Types.ObjectId;

  @Prop({required: true})
  quantity: number;

  @Prop({required: true})
  shelvesQuantity: number;
}

export const libraryStockSchema = SchemaFactory.createForClass(LibraryStock)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .index({name: 1});
