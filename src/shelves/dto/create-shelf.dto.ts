import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreateShelfDto extends OmitType(BaseDto, ['isPublic', 'isLink'] as const) {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  assetId: Types.ObjectId;
  @ApiProperty()
  @IsString()
  description: string;
}
