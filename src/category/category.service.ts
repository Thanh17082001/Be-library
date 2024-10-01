import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';
import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {Category} from './entities/category.entity';
import {SoftDeleteModel} from 'mongoose-delete';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private categoryModel: SoftDeleteModel<Category>) {}
  async create(createDto: CreateCategoryDto): Promise<Category> {
    return await this.categoryModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Category>): Promise<PageDto<Category>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {isActive: 1};
    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          mongoQuery[key] = query[key];
        }
      });
    }

    //search document
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.categoryModel
        .find(mongoQuery)
        // .populate('aaaaaa')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.categoryModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: ObjectId): Promise<ItemDto<Category>> {
    return new ItemDto(await this.categoryModel.findById(id));
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    // const exits: Category = await this.categoryModel.findOne({
    //   name: updateCategoryDto.name,       // Tìm theo tên
    //   _id: { $ne: new Types.ObjectId(id) }  // Loại trừ ID hiện tại
    // });
    // if (!exits) {
    //   throw new BadRequestException('name already exists');
    // }
    const resource: Category = await this.categoryModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Category = await this.categoryModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.categoryModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<Category>> {
    const arrResult: Category[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Category = await this.categoryModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.categoryModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<Category>): Promise<PageDto<Category>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {}; // Điều kiện để tìm các tài liệu đã bị xóa mềm

    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          mongoQuery[key] = query[key];
        }
      });
    }

    // Tìm kiếm tài liệu
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.categoryModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.categoryModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Category>> {
    return new ItemDto(await this.categoryModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<Category> {
    const restoredDocument = await this.categoryModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<Category[]> {
    const restoredDocuments = await this.categoryModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }

    await this.categoryModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Category = await this.categoryModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.categoryModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.categoryModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
