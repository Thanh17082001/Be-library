import {Controller} from '@nestjs/common';
import {StatisticalService} from './statistical.service';

@Controller('statistical')
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}
}
