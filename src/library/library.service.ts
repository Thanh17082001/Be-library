import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { Library } from './entities/library.entity';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { PageOptionsDto } from 'src/utils/page-option-dto';
import { ItemDto, PageDto } from 'src/utils/page.dto';
import { PageMetaDto } from 'src/utils/page.metadata.dto';


@Injectable()
export class LibraryService {
  constructor(@InjectModel(Library.name) private libraryModel: Model<Library>) { }
  async create(createDto: CreateLibraryDto): Promise<Library> {
    return await this.libraryModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Library>): Promise<PageDto<Library>> {
    const { page, limit, skip, order, search } = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order']
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
      this.libraryModel
        .find()
        // .populate('aaaaaa')
        .sort({ order: 1, createdAt: order === 'ASC' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
      ,
      this.libraryModel.countDocuments(),
    ]);

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    return new PageDto(results, pageMetaDto)
  }

  async findOne(id: ObjectId): Promise<ItemDto<Library>> {
    return new ItemDto(await this.libraryModel.findById(id));
  }

  async update(id: string, updateLibraryDto: UpdateLibraryDto): Promise<Library> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id')
    }
    const exits: Library = await this.libraryModel.findOne({
      name: updateLibraryDto.name,       // Tìm theo tên
      _id: { $ne: new Types.ObjectId(id) }  // Loại trừ ID hiện tại
    });
    if (!exits) {
      throw new NotFoundException('name already exists');
    }
    const resource: Library = await this.libraryModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.libraryModel.findByIdAndUpdate(id, updateLibraryDto, { returnDocument: 'after' });
  }

  async remove(id: string): Promise<Library> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id')
    }
    const resource: Library = await this.libraryModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.libraryModel.findByIdAndDelete(new Types.ObjectId(id))
  }
}