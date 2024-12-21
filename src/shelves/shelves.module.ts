import {Module} from '@nestjs/common';
import {ShelvesService} from './shelves.service';
import {ShelvesController} from './shelves.controller';
import {Mongoose} from 'mongoose';
import {MongooseModule} from '@nestjs/mongoose';
import {Shelves, ShelvesSchema} from './entities/shelf.entity';
import {CaslModule} from 'src/casl/casl.module';
import {AssetModule} from 'src/asset/asset.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Shelves.name, schema: ShelvesSchema}]), CaslModule, AssetModule],
  controllers: [ShelvesController],
  providers: [ShelvesService],
})
export class ShelvesModule {}
