import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseDocument } from 'src/common/base-document';


@Schema()
export class Group extends BaseDocument {

    @Prop({ required: true, unique: true })
    name: string;


    @Prop({ default:null })
    mainLibrary: Types.ObjectId | null;

}

export const GroupSchema = SchemaFactory.createForClass(Group);