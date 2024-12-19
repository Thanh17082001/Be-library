import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class CreateTypeAssetDto extends OmitType(BaseDto, ['libraryId', 'isPublic']) {
  @ApiProperty()
  @IsString()
  name: string;
}
