import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';

@Schema()
export class Supplier extends BaseDocument {
  @Prop({required: true})
  name: string;
  @Prop()
  phoneNumber: string;
  @Prop()
  address: string;
  @Prop()
  email: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic', 'isLink'])
  .index({name: 1});
