import {Module} from '@nestjs/common';
import {WarehouseReceiptService} from './warehouse-receipt.service';
import {WarehouseReceiptController} from './warehouse-receipt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WarehouseReceipt, WarehouseReceiptSchema } from './entities/warehouse-receipt.entity';
import { CaslModule } from 'src/casl/casl.module';
import { PublicationModule } from 'src/publication/publication.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: WarehouseReceipt.name, schema: WarehouseReceiptSchema }]), CaslModule, PublicationModule],
  controllers: [WarehouseReceiptController],
  providers: [WarehouseReceiptService],
})
export class WarehouseReceiptModule {}
