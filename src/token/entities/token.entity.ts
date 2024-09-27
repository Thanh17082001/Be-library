import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {BaseDocument} from 'src/common/base-document';

@Schema()
export class Token extends BaseDocument {
  @Prop({required: true})
  userId: Types.ObjectId;

  @Prop({required: true})
  refreshToken: string;

  @Prop({required: true})
  expiresAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
