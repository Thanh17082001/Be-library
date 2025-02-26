
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import { Types } from 'mongoose';

@Schema()
export class Topic extends BaseDocument {
    @Prop({ required: true })
    categoryId: Types.ObjectId;
    @Prop({ required: true })
    name: string;

}

export const TopicSchema = SchemaFactory.createForClass(Topic)
    .plugin(mongooseDelete, {
        overrideMethods: 'all',
        deletedAt: true,
        deletedBy: true,
    })
    .index({ name: 1 })
