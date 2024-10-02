import {ApiProperty, OmitType} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsDate, IsEmail, IsEnum, IsNotEmpty, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDocument} from 'src/common/base-document';
import {BaseDto} from 'src/common/base.dto';

export class SignUpDto extends OmitType(BaseDto, ['isPublic', 'groupId', 'libraryId'] as const) {
  @ApiProperty({example: 'string@gmail.com'})
  @IsString()
  email: string;

  password: string;

  passwordFirst: string;

  @ApiProperty({example: 'id'})
  @IsString()
  roleId: Types.ObjectId;

  @ApiProperty({example: 'id'})
  @IsString()
  groupId: Types.ObjectId;

  @ApiProperty({example: 'id'})
  @IsString()
  libraryId: Types.ObjectId;

  username: string;

  @ApiProperty()
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  address: string;

  avatar: string;

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
