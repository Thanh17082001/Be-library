import {CreateWarehouseReceiptDto} from './dto/create-warehouse-receipt.dto';
import {UpdateWarehouseReceiptDto} from './dto/update-warehouse-receipt.dto';

import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {SoftDeleteModel} from 'mongoose-delete';
import {WarehouseReceipt} from './entities/warehouse-receipt.entity';
import {PublicationService} from 'src/publication/publication.service';
import {Publication} from 'src/publication/entities/publication.entity';

@Injectable()
export class WarehouseReceiptService {
  constructor(
    @InjectModel(WarehouseReceipt.name) private warehouseReceiptModel: SoftDeleteModel<WarehouseReceipt>,
    private readonly publicationService: PublicationService
  ) {}
  async create(createDto: CreateWarehouseReceiptDto): Promise<WarehouseReceipt> {
    const publications = [];
    for (let i = 0; i < createDto.publications.length; i++) {
      const publicationId = createDto.publications[i].publicationId;
      const publication = await this.publicationService.findById(publicationId);

      publications.push({
        ...createDto.publications[i],
        ...publication,
      });
    }
    createDto.publications = publications;
    const result: WarehouseReceipt = await this.warehouseReceiptModel.create(createDto);
    
    return result;
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<CreateWarehouseReceiptDto>): Promise<PageDto<WarehouseReceipt>> {
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
      this.warehouseReceiptModel
        .find(mongoQuery)
        // .populate('aaaaaa')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.warehouseReceiptModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<WarehouseReceipt>> {
    return new ItemDto(await this.warehouseReceiptModel.findById(id));
  }

  async update(id: string, updateDto: UpdateWarehouseReceiptDto): Promise<WarehouseReceipt> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const resource: WarehouseReceipt = await this.warehouseReceiptModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.warehouseReceiptModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<WarehouseReceipt> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: WarehouseReceipt = await this.warehouseReceiptModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.warehouseReceiptModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<WarehouseReceipt>> {
    const arrResult: WarehouseReceipt[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: WarehouseReceipt = await this.warehouseReceiptModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.warehouseReceiptModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<CreateWarehouseReceiptDto>): Promise<PageDto<WarehouseReceipt>> {
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
      this.warehouseReceiptModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.warehouseReceiptModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<WarehouseReceipt>> {
    return new ItemDto(await this.warehouseReceiptModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<WarehouseReceipt> {
    const restoredDocument = await this.warehouseReceiptModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<WarehouseReceipt[]> {
    const restoredDocuments = await this.warehouseReceiptModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.warehouseReceiptModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<WarehouseReceipt> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: WarehouseReceipt = await this.warehouseReceiptModel.findOneDeleted(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.warehouseReceiptModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.warehouseReceiptModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}