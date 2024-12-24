import {ApiProperty, OmitType} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDocument} from 'src/common/base-document';
import {BaseDto} from 'src/common/base.dto';

export class CreateUserDto extends OmitType(BaseDto, ['isPublic', 'isLink'] as const) {
  @ApiProperty({example: 'string@gmail.com'})
  @IsString()
  email?: string = '';

  password: string;

  passwordFirst: string;

  @ApiProperty()
  @IsString()
  roleId: Types.ObjectId;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  class?: string = '';

  @ApiProperty()
  @IsOptional()
  @IsString()
  school?: string = '';

  @ApiProperty()
  @IsString()
  phoneNumber?: string = '';

  @ApiProperty()
  @IsString()
  address?: string = '';

  avatar: string;

  barcode: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  birthday: Date;

  @ApiProperty({enum: ['nam', 'nữ', 'khác']})
  @IsEnum(['nam', 'nữ', 'khác'])
  @IsString()
  gender: string;

  @ApiProperty({type: 'file', format: 'file', required: false})
  file?: Express.Multer.File;
}
