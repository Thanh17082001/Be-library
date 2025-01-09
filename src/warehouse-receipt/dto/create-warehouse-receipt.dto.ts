import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class WarehouseItem {
  @ApiProperty({type: String, description: 'ID của ấn phẩm (Publication)'})
  publicationId: Types.ObjectId;

  @ApiProperty({type: Number})
  quantityWarehouse: number;
  @ApiProperty({type: Number})
  @IsNumber()
  priceInput?: number = 0;
  @ApiProperty({type: Number})
  @IsNumber()
  priceOutput?: number = 0;
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
