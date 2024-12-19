import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';
import {Asset} from 'src/asset/entities/asset.entity';

export class StockAssetItem extends Asset {
  assetId: Types.ObjectId;
  quantity: number;
}
@Schema()
export class StockAsset extends BaseDocument {
  @Prop({required: true, ref: 'Supplier'})
  supplierId: Types.ObjectId;
  @Prop({
    required: true,
  })
  assets: StockAssetItem[];
  @Prop({default: false})
  isAccept: boolean;
  @Prop({unique: true})
  barcode: string;
}

export const StockAssetSchema = SchemaFactory.createForClass(StockAsset)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic', 'isLink']);
