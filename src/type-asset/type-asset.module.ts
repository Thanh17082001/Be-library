import {Module} from '@nestjs/common';
import {TypeAssetService} from './type-asset.service';
import {TypeAssetController} from './type-asset.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {TypeAsset, TypeAssetSchema} from './entities/type-asset.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: TypeAsset.name, schema: TypeAssetSchema}]), CaslModule],
  controllers: [TypeAssetController],
  providers: [TypeAssetService],
})
export class TypeAssetModule {}
