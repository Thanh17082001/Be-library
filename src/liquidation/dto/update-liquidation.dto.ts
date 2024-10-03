import {PartialType} from '@nestjs/swagger';
import {CreateLiquidationDto} from './create-liquidation.dto';

export class UpdateLiquidationDto extends PartialType(CreateLiquidationDto) {}
