import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

export class SearchName {
  @ApiProperty()
  @IsString()
  search: string;
  @ApiProperty()
  @IsString()
  libraryId: string;
}
