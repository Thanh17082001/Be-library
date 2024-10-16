import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class CreateTypeVoiceDto extends OmitType(BaseDto, ['isLink', 'isPublic', 'note'] as const) {
  @ApiProperty()
  @IsString()
  name: string;
}
