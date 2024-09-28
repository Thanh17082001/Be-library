import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Publication extends BaseDocument {
  @Prop()
  name: string;
  @Prop()
  barcode: string;
  @Prop()
  priviewImage: string;
  @Prop()
  path: string;
  @Prop()
  description: string;
  @Prop({default: 0})
  quantity: number;
  @Prop({default: 0})
  shelverQuantity: number;
  @Prop({enum: ['trên kệ', 'thanh lý', 'bị hư hại', 'có sẵn', 'không có sẵn'], default: 'có sẵn'})
  status: string;
  @Prop({enum: ['ấn phẩn cứng', 'ấn phẩm mềm']})
  type: string;

  @Prop({default: []})
  images: string[];

  @Prop({type: Types.ObjectId, ref: 'category'})
  categoryId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'author'})
  authorId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'shelves'})
  shelvesId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'publisher'})
  publisherId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'material'})
  materialId: Types.ObjectId;
}

const PublicationSchema = SchemaFactory.createForClass(Publication);
PublicationSchema.remove(['isLink', 'groupId']);

export {PublicationSchema};
