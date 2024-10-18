import {OmitType, PartialType} from '@nestjs/swagger';
import {CreateUserDto} from './create-user.dto';
import {Types} from 'mongoose';

export class UpdateUserDto extends OmitType(CreateUserDto, ['password', 'username'] as const) {}
