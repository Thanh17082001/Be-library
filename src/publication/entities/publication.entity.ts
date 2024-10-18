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
  @Prop()
  mimetype: string;
  @Prop({default: 0})
  quantity: number;
  @Prop({default: 0})
  totalQuantity: number;
  @Prop({default: 0})
  shelvesQuantity: number;
  @Prop({enum: ['thanh lý', 'bị hư hỏng', 'có sẵn', 'không có sẵn'], default: 'có sẵn'})
  status: string;
  @Prop({enum: ['ấn phẩm cứng', 'ấn phẩm mềm']})
  type: string;

  @Prop({default: []})
  images: string[];

  @Prop({type: [Types.ObjectId], ref: 'Category'})
  categoryIds: Types.ObjectId[];

  @Prop({type: [Types.ObjectId], ref: 'Author'})
  authorIds: Types.ObjectId[];

  @Prop({type: Types.ObjectId, ref: 'Shelves', default: null})
  shelvesId: Types.ObjectId;

  @Prop({type: [Types.ObjectId], ref: 'Publisher'})
  publisherIds: Types.ObjectId[];

  @Prop({type: [Types.ObjectId], ref: 'Material'})
  materialIds: Types.ObjectId[];
}

const PublicationSchema = SchemaFactory.createForClass(Publication).index({name: 1});

export {PublicationSchema};
