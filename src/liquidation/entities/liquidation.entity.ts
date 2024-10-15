import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';
import {Publication} from 'src/publication/entities/publication.entity';

@Schema()
export class Liquidation extends BaseDocument {
  @Prop({required: true, ref: Publication.name})
  publicationId: Types.ObjectId;
  @Prop({default: ''})
  reason: string;
  @Prop({default: 0})
  quantity: number;
  @Prop({enum: ['thanh lý', 'hư hỏng']})
  status: string;
  @Prop({enum: ['trong kho', 'trên kệ']})
  position: string;
}

export const LiquidationSchema = SchemaFactory.createForClass(Liquidation)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isLink', 'isPublic']);
