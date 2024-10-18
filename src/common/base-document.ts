import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {Library} from 'src/library/entities/library.entity';
import {User} from 'src/user/entities/user.entity';

@Schema({timestamps: true})
export class BaseDocument extends Document {
  @Prop({default: null, ref: 'User'})
  createBy: Types.ObjectId | null;

  // @Prop({default: null})
  // groupId: Types.ObjectId | null;

  @Prop({ref: 'Library'})
  libraryId: Types.ObjectId;

  @Prop({default: null})
  isPublic: boolean | null;

  @Prop({default: false})
  isLink: boolean;

  @Prop({default: Date.now})
  createdAt: Date;

  @Prop({default: Date.now})
  updatedAt: Date;

  @Prop({default: true})
  isActive: boolean;

  @Prop({default: ''})
  note: string;
}

export const BaseDocumentSchema = SchemaFactory.createForClass(BaseDocument);
