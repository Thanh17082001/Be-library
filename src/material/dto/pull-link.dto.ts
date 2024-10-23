import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsArray, IsOptional, IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class PullLinkDto extends BaseDto {
  @ApiProperty({example: ['id1', 'id2']})
  @IsArray()
  // @IsOptional()
  @IsString({each: true})
  ids: string[];
}
