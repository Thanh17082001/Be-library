import {ApiProperty} from '@nestjs/swagger';

export class ImportExcel {
  @ApiProperty({type: 'file', format: 'file', required: true})
  file: Express.Multer.File;
}
