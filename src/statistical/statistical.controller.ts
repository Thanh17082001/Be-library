import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {StatisticalService} from './statistical.service';
import {Public} from 'src/auth/auth.decorator';
import {AppAbility} from 'src/casl/casl-ability.factory/casl-ability.factory';
import {CheckPolicies} from 'src/casl/check-policies.decorator';
import {Action} from 'src/casl/casl.action';
import {CaslGuard} from 'src/casl/casl.guard';
import {Types} from 'mongoose';

@Controller('statistical')
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}
  @Get('')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'statisticals')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async getTotalBooks(@Req() request: Request) {
    const user = request['user'] ?? null;
    let libraryId: Types.ObjectId = new Types.ObjectId(user?.libraryId);
    if (user.isAdmin) {
      libraryId = null;
    }
    const totalBooks = await this.statisticalService.statisticalPublication(libraryId);
    return totalBooks;
  }
}
