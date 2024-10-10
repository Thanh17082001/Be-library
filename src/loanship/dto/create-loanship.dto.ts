import {Types} from 'mongoose';
import {ApiProperty, OmitType} from '@nestjs/swagger';
import {BaseDto} from 'src/common/base.dto';
import {IsBoolean, IsDate, IsOptional, IsString} from 'class-validator';
import {Type} from 'class-transformer';

export class LoanSlipItem {
  @ApiProperty({type: String, description: 'ID của ấn phẩm (Publication)'})
  publicationId: Types.ObjectId;

  // @ApiProperty({type: String, description: 'Tên của ấn phẩm'})
  // name: string;

  @ApiProperty({type: Number, description: 'Số lượng ấn phẩm được mượn'})
  quantityLoan: number;

  @ApiProperty({enum: ['trong kho', 'trên kệ'], default: 'trên kệ', description: 'vị trí sách được mượn'})
  position: string = 'trên kệ';
}

export class CreateLoanshipDto extends OmitType(BaseDto, ['isPublic']) {
  @ApiProperty({example: 'userId'})
  @IsString()
  userId: Types.ObjectId;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  borrowedDay: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  returnDay: Date;

  @ApiProperty()
  @IsString()
  status: string;

  // @ApiProperty()
  // @IsString()
  barcode: string;

  @ApiProperty()
  @IsBoolean()
  isPrint: boolean;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  receiptDate: Date;

  @ApiProperty({type: [LoanSlipItem]})
  @IsOptional()
  publications: LoanSlipItem[];
}
