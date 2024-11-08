import {OmitType} from '@nestjs/swagger';
import {CreateUserDto} from './create-user.dto';

export class ChangeInfoUserDto extends OmitType(CreateUserDto, ['note', 'password', 'username', 'roleId', 'passwordFirst', 'barcode'] as const) {}
