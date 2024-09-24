import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseDocument } from 'src/common/base-document';


@Schema()
export class Material extends BaseDocument {
    @Prop({ required: true })
    name: string;

    @Prop({ default: '' })
    desciption: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
