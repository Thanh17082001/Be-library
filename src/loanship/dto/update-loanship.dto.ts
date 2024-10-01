import {PartialType} from '@nestjs/swagger';
import {CreateLoanshipDto} from './create-loanship.dto';

export class UpdateLoanshipDto extends PartialType(CreateLoanshipDto) {}
