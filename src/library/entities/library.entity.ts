import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Library extends BaseDocument {
  @Prop({required: true, unique: true})
  name: string;

  @Prop({default: null})
  address?: string | null;

  @Prop({default: null})
  phoneNumber?: string | null;

  @Prop({default: null})
  email?: string | null;

  @Prop({default: null})
  facebook?: string | null;

  @Prop({default: null})
  managementAgency?: string | null;
}

export const LibrarySchema = SchemaFactory.createForClass(Library);

LibrarySchema.index({name: 1}); // Index cho tên
LibrarySchema.index({email: 1}); // Index cho email
LibrarySchema.index({phoneNumber: 1}); // Index cho số điện thoại
