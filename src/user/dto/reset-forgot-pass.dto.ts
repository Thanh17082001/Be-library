import {ApiProperty} from '@nestjs/swagger';
import {IsMongoId, IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class ResetPassDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
