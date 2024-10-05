import {ApiProperty} from '@nestjs/swagger';

export class ExportExcel {
  @ApiProperty({type: 'file', format: 'file', required: true})
  file: Express.Multer.File;
}
