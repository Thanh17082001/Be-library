import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class LiquidationItem {
  @ApiProperty({enum: ['Asset', 'Publication'], default: 'Asset'})
  type: string;
  @ApiProperty({example: 'id asset or publication'})
  itemId: Types.ObjectId;
  @ApiProperty()
  quantityLiquidation: number;
  @ApiProperty()
  priceLiquidation: number;

  @ApiProperty({enum: ['trong kho', 'trưng bày']})
  @IsString()
  position: string;
}

export class CreateLiquidationDto extends OmitType(BaseDto, ['isLink', 'isPublic']) {
  @ApiProperty({type: [LiquidationItem]})
  @IsOptional()
  liquidations: LiquidationItem[];
  @ApiProperty()
  @IsString()
  reason: string;
  // @ApiProperty({enum: ['thanh lý']})
  @IsString()
  status?: string = 'thanh lý';
  signature?: string = '';
  isAccept?: boolean = false;
}
