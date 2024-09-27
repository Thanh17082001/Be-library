import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreatePublicationDto extends OmitType(BaseDto, ['groupId']) {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  barcode: string;

  priviewImage: string;

  path: string;

  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty()
  @IsString()
  quantity: number;
  @ApiProperty()
  @IsString()
  shelverQuantity: number;
  @ApiProperty({enum: ['trên kệ', 'thanh lý', 'bị hư hại', 'có sẵn', 'không có sẵn']})
  @IsString()
  status: string;
  @ApiProperty({enum: ['ấn phẩn cứng', 'tài liệu điện tử']})
  @IsString()
  type: string;

  @ApiProperty({example: 'id'})
  @IsString()
  categoryId: Types.ObjectId;

  @ApiProperty({example: 'id'})
  @IsString()
  authorId: Types.ObjectId;

  @ApiProperty({example: 'id'})
  @IsString()
  shelvesId: Types.ObjectId;

  @ApiProperty({example: 'id'})
  @IsString()
  publisherId: Types.ObjectId;

  @ApiProperty({example: 'id'})
  @IsString()
  materialId: Types.ObjectId;

  @ApiProperty({type: 'file', format: 'file', required: false})
  file?: Express.Multer.File;
}
