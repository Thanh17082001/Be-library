import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class CreateMaterialDto extends BaseDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description?: string = '';
}
