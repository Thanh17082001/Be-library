import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreatePublicationDto extends BaseDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  barcode: string;

  priviewImage: string;

  path: string;
  images: string[];

  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty()
  @IsOptional()
  quantity: number = 0;
  @ApiProperty()
  @IsOptional()
  shelvesQuantity: number = 0;
  @ApiProperty({enum: ['trên kệ', 'thanh lý', 'bị hư hại', 'có sẵn', 'không có sẵn']})
  @IsString()
  status: string;
  @ApiProperty({enum: ['ấn phẩm cứng', 'ấn phẩm mềm']})
  @IsString()
  type: string;

  @ApiProperty({example: ['id1', 'id2'], description: 'Array of category IDs'})
  @IsOptional()
  categoryIds: Types.ObjectId[];

  @ApiProperty({example: ['id1', 'id2']})
  @IsString()
  @IsOptional()
  authorIds: Types.ObjectId[];

  @ApiProperty({example: 'id'})
  @IsString()
  @IsOptional()
  shelvesId: Types.ObjectId = null;

  @ApiProperty({example: ['id1', 'id2']})
  @IsString()
  @IsOptional()
  publisherIds: Types.ObjectId[];

  @ApiProperty({example: ['id1', 'id2']})
  @IsString()
  @IsOptional()
  materialIds: Types.ObjectId[];

  @ApiProperty({type: 'file', format: 'file', required: false})
  file?: Express.Multer.File;
}
