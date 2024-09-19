import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/common/base-document';


@Schema()
export class Example extends BaseDocument {
    @Prop({ required: true })
    name: string;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);