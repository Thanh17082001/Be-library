import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import { Types } from 'mongoose';

@Schema()
export class Liquidation extends BaseDocument {
    @Prop({ required: true })
    publicationId: Types.ObjectId;
    @Prop({ default: '' })
    reason: string;
    @Prop({ default: 0 })
    quantity: number;
    @Prop({ enum: ['thanh lý', 'hư hỏng'] })
    status: string;
}

export const liquidationSchema = SchemaFactory.createForClass(Liquidation)
    .plugin(mongooseDelete, {
        overrideMethods: 'all',
        deletedAt: true,
        deletedBy: true,
    })
    .remove(['isLink', 'isPublic'])
    .index({ reason: 1 });
