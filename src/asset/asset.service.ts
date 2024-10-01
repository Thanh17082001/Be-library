import {CreateAssetDto} from './dto/create-asset.dto';
import {UpdateAssetDto} from './dto/update-asset.dto';

import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {SoftDeleteModel} from 'mongoose-delete';
import {Asset} from './entities/asset.entity';

@Injectable()
export class AssetService {
  constructor(@InjectModel(Asset.name) private exampleModel: SoftDeleteModel<Asset>) {}
  async create(createDto: CreateAssetDto): Promise<Asset> {
    return await this.exampleModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Asset>): Promise<PageDto<Asset>> {
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
      this.exampleModel
        .find(mongoQuery)
        // .populate('aaaaaa')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.exampleModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<Asset>> {
    return new ItemDto(await this.exampleModel.findById(id));
  }

  async update(id: string, updateDto: UpdateAssetDto): Promise<Asset> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    // const exits: Asset = await this.exampleModel.findOne({
    //   name: updateDto.name, // Tìm theo tên
    //   _id: { $ne: new Types.ObjectId(id) }, // Loại trừ ID hiện tại
    // });
    // if (exits) {
    //   throw new BadRequestException('name already exists');
    // }
    const resource: Asset = await this.exampleModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.exampleModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<Asset> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Asset = await this.exampleModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.exampleModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<Asset>> {
    const arrResult: Asset[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Asset = await this.exampleModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.exampleModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<Asset>): Promise<PageDto<Asset>> {
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
      this.exampleModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.exampleModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Asset>> {
    return new ItemDto(await this.exampleModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<Asset> {
    const restoredDocument = await this.exampleModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<Asset[]> {
    const restoredDocuments = await this.exampleModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.exampleModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<Asset> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Asset = await this.exampleModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.exampleModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.exampleModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
