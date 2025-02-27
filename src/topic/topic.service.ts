import {CreateTopicDto} from './dto/create-topic.dto';
import {UpdateTopicDto} from './dto/update-topic.dto';

import {Topic} from './entities/topic.entity';
import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {SoftDeleteModel} from 'mongoose-delete';

@Injectable()
export class TopicService {
  constructor(@InjectModel(Topic.name) private topicModel: SoftDeleteModel<Topic>) {}
  async create(createDto: CreateTopicDto): Promise<Topic> {
    createDto.name = createDto.name.trim().toLocaleLowerCase();

    const exits: Topic = await this.topicModel.findOne({
      name: createDto.name, // Tìm theo tên
      categoryIds: {$all: createDto.categoryIds}, // Tìm theo categoryId
    });
    if (exits) {
      throw new BadRequestException('name already exists');
    }
    return await this.topicModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Topic>): Promise<PageDto<Topic>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {isActive: 1};
    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          if (['categoryIds'].includes(key)) {
            if (query[key].split(',').length > 1) {
              const ids = query[key].split(',').map(id => id); // Tách mảng và chuyển thành ObjectId
              mongoQuery[key] = {$in: ids}; // Tìm các bản ghi có id trong mảng
            } else {
              mongoQuery[key] = {$in: [query[key]]};
            }
          }
        }
      });
    }

    //search document
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.topicModel
        .find(mongoQuery)
        .populate('categoryIds')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.topicModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<Topic>> {
    return new ItemDto(await this.topicModel.findById(id));
  }

  async update(id: string, updateDto: UpdateTopicDto): Promise<Topic> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    // const exits: Topic = await this.topicModel.findOne({
    //   name: updateDto.name, // Tìm theo tên
    //   categoryIds: updateDto.categoryIds, // Tìm theo categoryId
    //   _id: {$ne: new Types.ObjectId(id)}, // Loại trừ ID hiện tại
    // });
    // if (exits) {
    //   throw new BadRequestException('name already exists');
    // }
    const resource: Topic = await this.topicModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.topicModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  //xóa cứng
  async delete(id: string): Promise<Topic> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Topic = await this.topicModel.findOneDeleted(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.topicModel?.findByIdAndDelete(new Types.ObjectId(id));
  }
  //xóa cứng
  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.topicModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
