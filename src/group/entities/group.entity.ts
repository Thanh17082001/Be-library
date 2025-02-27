import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Group extends BaseDocument {
  @Prop({required: true, unique: true})
  name: string;

  @Prop({default: null, ref: 'Library'})
  mainLibrary: Types.ObjectId | null;

  @Prop({default: [], ref: 'Library'})
  libraries: Types.ObjectId[] | [];
}

export const GroupSchema = SchemaFactory.createForClass(Group).remove(['groupId']);

GroupSchema.index({name: 1}).remove(['groupId']);
