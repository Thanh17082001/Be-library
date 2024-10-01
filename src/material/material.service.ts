import {CreateMaterialDto} from './dto/create-material.dto';
import {UpdateMaterialDto} from './dto/update-material.dto';
import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {Material} from './entities/material.entity';
import {SoftDeleteModel} from 'mongoose-delete';

@Injectable()
export class MaterialService {
  constructor(@InjectModel(Material.name) private materialModel: SoftDeleteModel<Material>) {}
  async create(createDto: CreateMaterialDto): Promise<Material> {
    return await this.materialModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Material>): Promise<PageDto<Material>> {
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
      this.materialModel
        .find(mongoQuery)
        // .populate('aaaaaa')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.materialModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: ObjectId): Promise<ItemDto<Material>> {
    return new ItemDto(await this.materialModel.findById(id));
  }

  async update(id: string, updateExampleDto: UpdateMaterialDto): Promise<Material> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    // const exits: Material = await this.materialModel.findOne({
    //   name: updateExampleDto.name,       // Tìm theo tên
    //   _id: { $ne: new Types.ObjectId(id) }  // Loại trừ ID hiện tại
    // });
    // if (!exits) {
    //   throw new BadRequestException('name already exists');
    // }
    const resource: Material = await this.materialModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.materialModel.findByIdAndUpdate(id, updateExampleDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<Material> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Material = await this.materialModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.materialModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<Material>> {
    const arrResult: Material[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Material = await this.materialModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.materialModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<Material>): Promise<PageDto<Material>> {
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
      this.materialModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.materialModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Material>> {
    return new ItemDto(await this.materialModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<Material> {
    const restoredDocument = await this.materialModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<Material[]> {
    const restoredDocuments = await this.materialModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }

    await this.materialModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<Material> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Material = await this.materialModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.materialModel?.findByIdAndDelete(new Types.ObjectId(id));
  }
  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.materialModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
