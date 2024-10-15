import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class WarehouseItem {
  @ApiProperty({type: String, description: 'ID của ấn phẩm (Publication)'})
  publicationId: Types.ObjectId;

  @ApiProperty({type: Number})
  quantityWarehouse: number;
}

export class CreateWarehouseReceiptDto extends OmitType(BaseDto, ['isPublic', 'isLink']) {
  @ApiProperty({example: 'supplierId'})
  @IsString()
  supplierId: Types.ObjectId;

  @ApiProperty({type: [WarehouseItem]})
  @IsOptional()
  publications: WarehouseItem[];

  barcode: string;
}
