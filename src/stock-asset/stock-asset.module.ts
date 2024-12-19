import {Module} from '@nestjs/common';
import {StockAssetService} from './stock-asset.service';
import {StockAssetController} from './stock-asset.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {StockAsset, StockAssetSchema} from './entities/stock-asset.entity';
import {CaslModule} from 'src/casl/casl.module';
import {AssetModule} from 'src/asset/asset.module';

@Module({
  imports: [MongooseModule.forFeature([{name: StockAsset.name, schema: StockAssetSchema}]), CaslModule, AssetModule],
  controllers: [StockAssetController],
  providers: [StockAssetService],
})
export class StockAssetModule {}
