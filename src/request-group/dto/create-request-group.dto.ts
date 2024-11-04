import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsMongoId, IsOptional, IsString} from 'class-validator';
import {Types} from 'mongoose';

export class CreateRequestGroupDto {
  @IsOptional()
     @IsMongoId()
  createBy?: Types.ObjectId=null;
  // @ApiProperty()
  @IsOptional()
   @IsMongoId()
  libraryId?: Types.ObjectId=null;
  // @ApiProperty({example:'id'})
  @IsOptional()
   @IsMongoId()
  mainLibraryId?: Types.ObjectId;
  @ApiProperty({example: 'id'})
   @IsMongoId()
  groupId: Types.ObjectId;

  @IsBoolean()
  isAgree?: boolean = false;
}
