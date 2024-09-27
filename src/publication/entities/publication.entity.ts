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
  @Prop({enum: ['ấn phẩn cứng', 'tài liệu điện tử']})
  type: string;

  @Prop({type: Types.ObjectId, ref: 'category', required: true})
  categoryId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'author', required: true})
  authorId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'shelves', required: true})
  shelvesId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'publisher', required: true})
  publisherId: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'material', required: true})
  materialId: Types.ObjectId;
}

const PublicationSchema = SchemaFactory.createForClass(Publication);
PublicationSchema.remove(['isLink', 'groupId']);

export {PublicationSchema};
