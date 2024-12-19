import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreateAssetDto extends OmitType(BaseDto, ['isPublic']) {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  typeAssetId: Types.ObjectId;
  @ApiProperty()
  @IsNumber()
  quantityUsed: number;
  @ApiProperty()
  @IsNumber()
  quantityTotal: number;
  @ApiProperty()
  @IsNumber()
  quantityWarehouse: number;
  @ApiProperty()
  @IsNumber()
  quantityDamage: number;
  @ApiProperty()
  @IsNumber()
  quantityLiquidation: number;
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsString()
  description: string;
}
