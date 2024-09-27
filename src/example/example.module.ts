import {Module} from '@nestjs/common';
import {ExampleService} from './example.service';
import {ExampleController} from './example.controller';
import {Example, ExampleSchema} from './entities/example.entity';
import {MongooseModule} from '@nestjs/mongoose';
import {CaslGuard} from 'src/casl/casl.guard';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Example.name, schema: ExampleSchema}]), CaslModule],
  controllers: [ExampleController],
  providers: [ExampleService, CaslGuard],
})
export class ExampleModule {}
