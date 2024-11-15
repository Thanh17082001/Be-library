import {ApiProperty} from '@nestjs/swagger';
import {IsMongoId, IsNotEmpty, IsString} from 'class-validator';

export class ChangeUsernameDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
