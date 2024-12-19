import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreateStockAssetDtoItem {
  @ApiProperty({type: String, description: 'ID của ấn phẩm (asset)'})
  assetId: Types.ObjectId;

  @ApiProperty({type: Number})
  quantity: number;
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
