import {ApiProperty} from '@nestjs/swagger';
import {IsMongoId, IsNotEmpty, IsString} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
