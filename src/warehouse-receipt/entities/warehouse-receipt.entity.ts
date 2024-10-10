import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';
import {Publication} from 'src/publication/entities/publication.entity';

export class WarehouseReceiptItem extends Publication {
  publicationId: Types.ObjectId;
  quantityWarehouse: number;
}
@Schema()
export class WarehouseReceipt extends BaseDocument {
  @Prop({required: true})
  supplierId: Types.ObjectId;
  @Prop({
    required: true,
  })
  publications: WarehouseReceiptItem[];
}

export const WarehouseReceiptSchema = SchemaFactory.createForClass(WarehouseReceipt)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic', 'isLink']);
