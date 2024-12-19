import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';

@Schema()
export class Asset extends BaseDocument {
  @Prop({require: true, ref: 'TypeAsset'})
  typeAssetId: Types.ObjectId;
  @Prop({required: true})
  name: string;
  @Prop({default: 0})
  quantityUsed: number;
  @Prop({default: 0})
  quantityTotal: number;
  @Prop({default: 0})
  quantityWarehouse: number;
  @Prop({default: 0})
  quantityDamage: number;
  @Prop({default: 0})
  quantityLiquidation: number;
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
