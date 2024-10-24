import {Module} from '@nestjs/common';
import {AuthorService} from './author.service';
import {AuthorController} from './author.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Author, AuthorSchema} from './entities/author.entity';
import {CaslModule} from 'src/casl/casl.module';
import {GroupModule} from 'src/group/group.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Author.name, schema: AuthorSchema}]), CaslModule, GroupModule],
  controllers: [AuthorController],
  providers: [AuthorService],
  exports: [AuthorService, MongooseModule],
})
export class AuthorModule {}
