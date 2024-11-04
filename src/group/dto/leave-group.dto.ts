import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

export class LeaveGroupDto {
  @ApiProperty()
  @IsString()
  libraryId: string;
  @ApiProperty()
  @IsString()
  groupId: string;
}
