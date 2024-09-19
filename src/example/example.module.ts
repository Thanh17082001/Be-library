import { Module } from '@nestjs/common';
import { ExampleService } from './example.service';
import { ExampleController } from './example.controller';
import { Example, ExampleSchema } from './entities/example.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Example.name, schema: ExampleSchema }])],
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class ExampleModule {}
