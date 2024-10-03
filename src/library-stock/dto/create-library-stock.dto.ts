import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreateLibraryStockDto extends OmitType(BaseDto, ['isPublic']) {
  @ApiProperty()
  @IsString()
  publicationId: Types.ObjectId;
  @ApiProperty()
  @IsString()
  shelvesId: Types.ObjectId;
  @ApiProperty()
  @IsNumber()
  quantity: number;
  @ApiProperty()
  @IsString()
  status: string;
}
