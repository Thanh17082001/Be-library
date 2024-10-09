import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';

export type WarehouseReceiptItem = {
  publicationId: Types.ObjectId;
  quantity: number;
};
@Schema()
export class WarehouseReceipt extends BaseDocument {
  @Prop({required: true})
  supplierId: Types.ObjectId;
  @Prop({
    type: [
      {
        publicationId: {type: Types.ObjectId, ref: 'Publication'},
        quantity: Number,
        _id: false,
      },
    ],
    required: true,
  })
  publications: WarehouseReceiptItem[];
  @Prop({default: false})
  isAccept: boolean;
}

export const WarehouseReceiptSchema = SchemaFactory.createForClass(WarehouseReceipt)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic', 'isLink']);
