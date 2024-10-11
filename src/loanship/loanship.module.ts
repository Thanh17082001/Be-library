import {forwardRef, Module} from '@nestjs/common';
import {LoanshipService} from './loanship.service';
import {LoanshipController} from './loanship.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {LoanSlip, LoanSlipSchema} from './entities/loanship.entity';
import {CaslModule} from 'src/casl/casl.module';
import {PublicationModule} from 'src/publication/publication.module';
import {PublicationService} from 'src/publication/publication.service';

@Module({
  imports: [MongooseModule.forFeature([{name: LoanSlip.name, schema: LoanSlipSchema}]), CaslModule, forwardRef(() => PublicationModule)],
  controllers: [LoanshipController],
  providers: [LoanshipService],
  exports: [MongooseModule, LoanshipService],
})
export class LoanshipModule {}
