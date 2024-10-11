import {forwardRef, Module} from '@nestjs/common';
import {LiquidationService} from './liquidation.service';
import {LiquidationController} from './liquidation.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Liquidation, LiquidationSchema} from './entities/liquidation.entity';
import {LibrarySchema} from 'src/library/entities/library.entity';
import {CaslModule} from 'src/casl/casl.module';
import {PublicationModule} from 'src/publication/publication.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Liquidation.name, schema: LiquidationSchema}]), CaslModule, forwardRef(() => PublicationModule)],
  controllers: [LiquidationController],
  providers: [LiquidationService],
  exports: [LiquidationService, MongooseModule],
})
export class LiquidationModule {}
