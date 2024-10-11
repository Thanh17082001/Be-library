import {ApiProperty, ApiPropertyOptional, OmitType} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsDate, IsOptional} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class FilterDateDto extends OmitType(BaseDto, ['note']) {
  @ApiPropertyOptional()
  @IsOptional() // Chỉ định rằng trường này là tùy chọn
  @Type(() => Date) // Chuyển đổi giá trị thành Date object
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional()
  @IsOptional() // Chỉ định rằng trường này là tùy chọn
  @Type(() => Date) // Chuyển đổi giá trị thành Date object
  @IsDate()
  endDate: Date;
}
