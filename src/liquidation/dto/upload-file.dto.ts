import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsString} from 'class-validator';
import {Types} from 'mongoose';

export class fileSignature {
  path: string;
  typeFile: string;
  name: string;
}

export class UploadFileSignature {
  @ApiProperty({type: 'file', format: 'file', required: true})
  file: Express.Multer.File;
  fileSignature?: fileSignature;

  @IsString()
  update?: string = '0';
}
