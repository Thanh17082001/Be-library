import {Module} from '@nestjs/common';
import {PublicationService} from './publication.service';
import {PublicationController} from './publication.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Publication, PublicationSchema} from './entities/publication.entity';
import {CaslModule} from 'src/casl/casl.module';
import {AuthorModule} from 'src/author/author.module';
import {CategoryModule} from 'src/category/category.module';
import {MaterialModule} from 'src/material/material.module';
import {PublisherModule} from 'src/publisher/publisher.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Publication.name, schema: PublicationSchema}]), CaslModule, AuthorModule, CategoryModule, MaterialModule, PublisherModule],
  controllers: [PublicationController],
  providers: [PublicationService],
  exports: [PublicationService, MongooseModule],
})
export class PublicationModule {}
