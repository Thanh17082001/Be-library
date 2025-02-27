import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsArray, IsString} from 'class-validator';
import {Types} from 'mongoose';
import {BaseDto} from 'src/common/base.dto';

export class CreateTopicDto extends BaseDto {
  @ApiProperty({example: [new Types.ObjectId()]})
  @IsArray()
  categoryIds: Types.ObjectId[];
  @ApiProperty()
  @IsString()
  name: string;
}
