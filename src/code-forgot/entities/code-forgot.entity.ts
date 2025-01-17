import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
@Schema({timestamps: true})
export class CodeForgot extends Document {
  @Prop({required: true})
  code: string;
  @Prop({required: true})
  mail: string;
  @Prop({default: () => new Date(Date.now() + 60 * 1000)})
  codeExpiry: Date;
  @Prop()
  token: string;
  @Prop({default: false})
  isConfirm: boolean;
}

export const CodeForgotSchema = SchemaFactory.createForClass(CodeForgot).index({code: 1, email: 1});
