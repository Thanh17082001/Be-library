import {Module} from '@nestjs/common';
import {AssetService} from './asset.service';
import {AssetController} from './asset.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Asset, AssetSchema} from './entities/asset.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Asset.name, schema: AssetSchema}]), CaslModule],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
