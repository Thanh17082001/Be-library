import {Module} from '@nestjs/common';
import {SupplierService} from './supplier.service';
import {SupplierController} from './supplier.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Supplier, SupplierSchema} from './entities/supplier.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Supplier.name, schema: SupplierSchema}]), CaslModule],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
