import {PartialType} from '@nestjs/swagger';
import {EmailDto} from './create-mail.dto';

export class UpdateMailDto extends PartialType(EmailDto) {}
