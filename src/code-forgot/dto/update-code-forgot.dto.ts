import { PartialType } from '@nestjs/swagger';
import { CreateCodeForgotDto } from './create-code-forgot.dto';

export class UpdateCodeForgotDto extends PartialType(CreateCodeForgotDto) {}
