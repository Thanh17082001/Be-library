import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { Example } from './entities/example.entity';
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { PageOptionsDto } from 'src/utils/page-option-dto';
import { ItemDto, PageDto } from 'src/utils/page.dto';
import { PageMetaDto } from 'src/utils/page.metadata.dto';

@Injectable()
export class ExampleService {
  constructor(@InjectModel(Example.name) private exampleModel: Model<Example>) { }
  async create(createDto: CreateExampleDto): Promise<Example> {
    return await this.exampleModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Example>): Promise<PageDto<Example>> {
    const { page, limit, skip, order, search } = pageOptions;
    const pagination = ['page','limit', 'skip','order']
    const mongoQuery: any = { isActive: 1 };
    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          mongoQuery[key] = query[key];
        }
      });
    }

    //search document
    if (search) {
      mongoQuery.name = { $regex: new RegExp(search, 'i') }; 
    }
    
    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.exampleModel
        .find()
        // .populate('aaaaaa')
        .sort({ order: 1, createdAt: order === 'ASC' ? 1 : -1 }) 
        .skip(skip) 
        .limit(limit) 
        .lean()
        .exec()
        ,
      this.exampleModel.countDocuments(), 
    ]);

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    return new PageDto(results, pageMetaDto)
  }

  async findOne(id: ObjectId):Promise<ItemDto<Example>> {
    return new ItemDto(await this.exampleModel.findById(id));
  }

  async update(id: string, updateExampleDto: UpdateExampleDto):Promise<Example> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id')
    }

    const exits: Example = await this.exampleModel.findOne({
      name: updateExampleDto.name,       // Tìm theo tên
      _id: { $ne: new Types.ObjectId(id) }  // Loại trừ ID hiện tại
    });
    if (!exits) {
      throw new BadRequestException('name already exists');
    }
    const resource: Example = await this.exampleModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.exampleModel.findByIdAndUpdate(id, updateExampleDto, { returnDocument: 'after' });
  }

  async remove(id: string):Promise<Example> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id')
    }
    const resource: Example = await this.exampleModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.exampleModel.findByIdAndDelete(new Types.ObjectId(id))
  }
}
