import {Controller, Get, UseGuards} from '@nestjs/common';
import {StatisticalService} from './statistical.service';
import {Public} from 'src/auth/auth.decorator';
import {AppAbility} from 'src/casl/casl-ability.factory/casl-ability.factory';
import {CheckPolicies} from 'src/casl/check-policies.decorator';
import {Action} from 'src/casl/casl.action';
import {CaslGuard} from 'src/casl/casl.guard';

@Controller('statistical')
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}
  @Get('')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'statisticals')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async getTotalBooks() {
    const totalBooks = await this.statisticalService.statisticalPublication();
    return totalBooks;
  }
}
