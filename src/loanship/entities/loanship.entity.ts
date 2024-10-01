import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';

export class LoanSlipItem {
  publicationId: Types.ObjectId;
  name: string;
  quantityLoan: number;
}
@Schema()
export class LoanSlip extends BaseDocument {
  @Prop({ref: 'User', required: true})
  userId: Types.ObjectId;
  @Prop({default: Date.now()})
  borrowedDay: Date;
  @Prop({required: true})
  returnDay: Date;
  @Prop()
  status: string;
  @Prop()
  barcode: string;
  @Prop({default: false})
  isPrint: boolean;
  @Prop({required: true, default: Date.now()})
  maxLoanDuration: Date;
  @Prop({
    type: [
      {
        publicationId: {type: Types.ObjectId, ref: 'Publication'},
        name: String,
        quantityLoan: Number,
        _id: false,
      },
    ],
    required: true,
  })
  publications: LoanSlipItem[];
}

export const LoanSlipSchema = SchemaFactory.createForClass(LoanSlip)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic', 'isLink']);
