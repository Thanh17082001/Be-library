import {ObjectId, Types} from 'mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class CreateVoiceDto extends BaseDto {
  @ApiProperty()
  @IsString()
  publicationId: Types.ObjectId;
  @ApiProperty()
  @IsString()
  typeVoiceId: Types.ObjectId;

  path: string;

  @ApiProperty({type: 'file', format: 'file', required: false})
  file?: Express.Multer.File;
}
