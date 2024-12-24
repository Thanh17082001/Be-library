import {Publication} from './../../publication/entities/publication.entity';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';
import {Asset} from 'src/asset/entities/asset.entity';
import {isCancel} from 'axios';

export class LiquidationItem {
  @Prop({required: true})
  type: string; // Determines the model name ('Asset' or 'Publication')

  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'type', // Dynamically reference based on the `type` field
  })
  itemId: string;
  @Prop({required: true})
  quantityLiquidation: number;
  @Prop({required: true})
  priceLiquidation: number;
  @Prop({enum: ['trong kho', 'trưng bày']})
  position: string;
}
@Schema()
export class Liquidation extends BaseDocument {
  @Prop({default: ''})
  reason: string;
  @Prop({enum: ['thanh lý']})
  status: string;

  @Prop({type: [LiquidationItem], default: []})
  liquidations: LiquidationItem[];
  @Prop({default: []})
  signatures: string[];
  @Prop({default: false})
  isAccept: boolean;

  @Prop({default: false})
  isCancel: boolean;
}

export const LiquidationSchema = SchemaFactory.createForClass(Liquidation)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isLink', 'isPublic']);
