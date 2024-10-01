import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';

export class BaseDto {
  @IsOptional()
  groupId: Types.ObjectId | null;

  @IsOptional()
  libraryId: Types.ObjectId | null;

  @IsOptional()
  createBy: Types.ObjectId | null;

  @ApiProperty({example: false})
  @IsOptional()
  isPublic: boolean | null;

  @ApiProperty({example: ''})
  @IsOptional()
  note: string;
}
