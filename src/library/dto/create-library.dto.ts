import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsString} from 'class-validator';
import {BaseDto} from 'src/common/base.dto';

export class CreateLibraryDto extends OmitType(BaseDto, ['libraryId', 'isPublic']) {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address?: string | null;

  @ApiProperty()
  @IsString()
  phoneNumber?: string | null;

  @ApiProperty()
  @IsString()
  email?: string | null;

  @ApiProperty()
  @IsString()
  facebook?: string | null;

  @ApiProperty()
  @IsString()
  managementAgency?: string | null;
}
