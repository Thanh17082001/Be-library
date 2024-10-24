import {Module} from '@nestjs/common';
import {CategoryService} from './category.service';
import {CategoryController} from './category.controller';
import {Category, CategorySchema} from './entities/category.entity';
import {MongooseModule} from '@nestjs/mongoose';
import {CaslModule} from 'src/casl/casl.module';
import {GroupModule} from 'src/group/group.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Category.name, schema: CategorySchema}]), CaslModule, GroupModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, MongooseModule],
})
export class CategoryModule {}
