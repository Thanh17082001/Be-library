import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class CreateSupplierDto extends OmitType(BaseDto, ['isPublic', 'isLink'] as const) {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  phoneNumber: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  @IsString()
  email: string;
}
