import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BaseDocument extends Document {
    @Prop({default: null})
    createBy: Types.ObjectId | null;
    
    @Prop({ default: false })
    isPulic: boolean;

    @Prop({ default: false })
    isLink: boolean;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const BaseDocumentSchema = SchemaFactory.createForClass(BaseDocument);
