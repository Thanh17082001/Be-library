import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreateStockAssetDtoItem {
  @ApiProperty({type: String, description: 'ID của ấn phẩm (asset)'})
  @IsString()
  assetId: Types.ObjectId;

  @ApiProperty({type: Number})
  @IsNumber()
  quantity: number;
  @ApiProperty({type: Number})
  @IsNumber()
  price?: number = 0;
}

export class CreateStockAssetDto extends OmitType(BaseDto, ['isPublic', 'isLink']) {
  @ApiProperty({example: 'supplierId'})
  @IsString()
  supplierId: Types.ObjectId;

  @ApiProperty({type: [CreateStockAssetDtoItem]})
  @IsOptional()
  assets: CreateStockAssetDtoItem[];
  barcode?: string = '';
}
