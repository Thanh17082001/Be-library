import {PartialType} from '@nestjs/swagger';
import {CreateRequestGroupDto} from './create-request-group.dto';

export class UpdateRequestGroupDto extends PartialType(CreateRequestGroupDto) {}
