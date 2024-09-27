import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/common/base-document';


@Schema()
export class Publisher extends BaseDocument {
    @Prop({ required: true })
    name: string;
    @Prop({ default: '' })
    description: string;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);