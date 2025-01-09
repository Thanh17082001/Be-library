import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';
import {Publication} from 'src/publication/entities/publication.entity';

export class WarehouseReceiptItem extends Publication {
  publicationId: Types.ObjectId;
  quantityWarehouse: number;
  @Prop({required: true})
  priceInput: number;
  @Prop({required: true})
  priceOutput: number;
}
@Schema()
export class WarehouseReceipt extends BaseDocument {
  @Prop({required: true, ref: 'Supplier'})
  supplierId: Types.ObjectId;
  @Prop({
    required: true,
  })
  publications: WarehouseReceiptItem[];
  @Prop({default: false})
  isAccept: boolean;
  @Prop({unique: true})
  barcode: string;
}

export const WarehouseReceiptSchema = SchemaFactory.createForClass(WarehouseReceipt)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic', 'isLink']);
