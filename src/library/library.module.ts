import {Module} from '@nestjs/common';
import {LibraryService} from './library.service';
import {LibraryController} from './library.controller';
import {Mongoose} from 'mongoose';
import {MongooseModule} from '@nestjs/mongoose';
import {Library, LibrarySchema} from './entities/library.entity';
import {CaslModule} from 'src/casl/casl.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Library.name, schema: LibrarySchema}]), CaslModule],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService, MongooseModule],
})
export class LibraryModule {}
