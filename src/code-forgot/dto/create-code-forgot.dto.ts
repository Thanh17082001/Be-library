import {IsString} from 'class-validator';

export class CreateCodeForgotDto {
  @IsString()
  code: string;
  @IsString()
  mail: string;
}
