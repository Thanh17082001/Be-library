import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import * as mongooseDelete from 'mongoose-delete';
import {Types} from 'mongoose';
import {Publication} from 'src/publication/entities/publication.entity';

export class LoanSlipItem extends Publication {
  publicationId: Types.ObjectId;
  quantityLoan: number;
  position: string;
  quantityReturn: number;
}

export class LoanSlipHistory extends Publication {
  historyDate: Date;
  publicationId: Types.ObjectId;
  quantityLoan: number;
  position: string;
  quantityReturn: number;
  name: string;
  barcode: string;
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

  @Prop({default: false})
  isCancel: boolean;

  @Prop({default: false})
  isAgree: boolean;

  @Prop({default: false})
  isReturn: boolean;
  @Prop({required: true, default: Date.now()})
  receiptDate: Date;
  @Prop({
    required: true,
  })
  publications: LoanSlipItem[];

  @Prop({
    default: [],
  })
  historys: LoanSlipHistory[];
}

export const LoanSlipSchema = SchemaFactory.createForClass(LoanSlip)
  .plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true,
  })
  .remove(['isPublic']);
