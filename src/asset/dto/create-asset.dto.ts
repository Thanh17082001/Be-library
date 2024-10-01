import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class CreateAssetDto extends OmitType(BaseDto, ['isPublic']) {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  quantity: number;
  @ApiProperty()
  @IsString()
  description: string;
}
