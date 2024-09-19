import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BaseDocument extends Document {
    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const BaseDocumentSchema = SchemaFactory.createForClass(BaseDocument);
