import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

import * as mongooseDelete from 'mongoose-delete';

@Schema({timestamps: true})
export class RequestGroup extends Document {
  @Prop({ref: 'User'})
  createBy: Types.ObjectId;
  @Prop({ref: 'Library'})
  libraryId: Types.ObjectId;
  @Prop({ref: 'Library'})
  mainLibraryId: Types.ObjectId;
  @Prop({ref: 'Group'})
  groupId: Types.ObjectId;
  @Prop({default: false})
  isAgree: boolean;
}

export const RequestGroupSchema = SchemaFactory.createForClass(RequestGroup)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .index({name: 1});
