import {Module} from '@nestjs/common';
import {LiquidationService} from './liquidation.service';
import {LiquidationController} from './liquidation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Liquidation } from './entities/liquidation.entity';
import { LibrarySchema } from 'src/library/entities/library.entity';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Liquidation.name, schema: LibrarySchema }]), CaslModule],
  controllers: [LiquidationController],
  providers: [LiquidationService],
  exports: [LiquidationService, MongooseModule]
})
export class LiquidationModule {}
