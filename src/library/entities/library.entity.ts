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
