import {ApiProperty, OmitType} from '@nestjs/swagger';
import {CreateUserDto} from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeInfoUserDto extends OmitType(CreateUserDto, ['note', 'password', 'username', 'roleId', 'passwordFirst', 'barcode', 'libraryId', 'createBy'] as const) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username:string
}
