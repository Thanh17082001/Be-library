import {Module} from '@nestjs/common';
import {MaterialService} from './material.service';
import {MaterialController} from './material.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Material, MaterialSchema} from './entities/material.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Material.name, schema: MaterialSchema}]), CaslModule],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService, MongooseModule],
})
export class MaterialModule {}
