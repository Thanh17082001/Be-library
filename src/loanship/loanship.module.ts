import {Module} from '@nestjs/common';
import {LoanshipService} from './loanship.service';
import {LoanshipController} from './loanship.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {LoanSlip, LoanSlipSchema} from './entities/loanship.entity';
import {CaslModule} from 'src/casl/casl.module';
import {PublicationModule} from 'src/publication/publication.module';

@Module({
  imports: [MongooseModule.forFeature([{name: LoanSlip.name, schema: LoanSlipSchema}]), CaslModule, PublicationModule],
  controllers: [LoanshipController],
  providers: [LoanshipService],
  exports: [LoanshipService],
})
export class LoanshipModule {}