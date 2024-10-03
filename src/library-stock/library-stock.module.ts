import {Module} from '@nestjs/common';
import {LibraryStockService} from './library-stock.service';
import {LibraryStockController} from './library-stock.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {LibraryStock, libraryStockSchema} from './entities/library-stock.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: LibraryStock.name, schema: libraryStockSchema}]), CaslModule],
  controllers: [LibraryStockController],
  providers: [LibraryStockService],
  exports: [LibraryStockService, MongooseModule],
})
export class LibraryStockModule {}
