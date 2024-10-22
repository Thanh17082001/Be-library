import {ApiProperty} from '@nestjs/swagger';
import {IsOptional} from 'class-validator';
class LoanSlipReturn {
  @ApiProperty()
  publicationId: string;
  @ApiProperty()
  quantityReturn: number;
}
export class ReturnDto {
  @ApiProperty({example: [{publicationId: 'publicationId', quantityReturn: 1}]})
  @IsOptional()
  publications: LoanSlipReturn[];
}
