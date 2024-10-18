import {OmitType} from '@nestjs/swagger';
import {Sign} from 'crypto';
import {SignUpDto} from './sign-up.dto';

export class UpdateAuthDto extends OmitType(SignUpDto, ['password', 'passwordFirst', 'username', 'roleId'] as const) {}
