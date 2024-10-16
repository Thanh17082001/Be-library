import {Module} from '@nestjs/common';
import {StatisticalService} from './statistical.service';
import {StatisticalController} from './statistical.controller';
import {LoanshipModule} from 'src/loanship/loanship.module';
import {PublicationModule} from 'src/publication/publication.module';

@Module({
  imports: [LoanshipModule, PublicationModule],
  controllers: [StatisticalController],
  providers: [StatisticalService],
})
export class StatisticalModule {}
