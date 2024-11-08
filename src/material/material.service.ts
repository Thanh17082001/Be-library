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
import {Group} from 'src/group/entities/group.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: SoftDeleteModel<Material>,
    @InjectModel(Group.name) private groupModel: SoftDeleteModel<Group>
  ) {}
  async create(createDto: CreateMaterialDto): Promise<Material> {
    createDto.name = createDto.name.toLowerCase();
    const exits: Material = await this.materialModel.findOne({name: createDto.name, libraryId: new Types.ObjectId(createDto.libraryId)});
    if (exits) {
      throw new BadRequestException('name already exists');
    }
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
    if (Object.keys(mongoQuery).includes('libraryId')) {
      mongoQuery.libraryId = new Types.ObjectId(mongoQuery.libraryId);
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

  async findById(id: string): Promise<Material> {
    return await this.materialModel.findById(id);
  }

  async findByName(names: Array<string>, libraryId: string): Promise<Array<Types.ObjectId>> {
    const resources = await this.materialModel
      .find({name: {$in: names}, libraryId: new Types.ObjectId(libraryId)}, '_id') // Chỉ lấy trường _id
      .lean(); // Trả về dữ liệu đơn giản, không phải mongoose document

    // Trả về mảng các ObjectId
    return resources.map(item => item._id);
  }

  async update(id: string, updateExampleDto: UpdateMaterialDto): Promise<Material> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const exits: Material = await this.materialModel.findOne({
      name: updateExampleDto.name, // Tìm theo tên
      libraryId: new Types.ObjectId(updateExampleDto.libraryId),
      _id: {$ne: new Types.ObjectId(id)}, // Loại trừ ID hiện tại
    });
    if (exits) {
      throw new BadRequestException('name already exists');
    }
    const resource: Material = await this.materialModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (updateExampleDto.name) {
      updateExampleDto.name = updateExampleDto.name.toLowerCase();
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
    const resource: Material = await this.materialModel.findOneDeleted(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.materialModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deletes(ids: string[]): Promise<any> {
    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Material = await this.materialModel.findOneDeleted({_id: new Types.ObjectId(id)});
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      await this.materialModel?.findByIdAndDelete(new Types.ObjectId(id));
    }
  }

  //liên thông
  async GetIsLink(libraryId: string, pageOptions: PageOptionsDto, query: Partial<Material>): Promise<any> {
    const {page, limit, skip, order, search} = pageOptions;
    const group = await this.groupModel.findOne({
      libraries: {$in: [libraryId]},
    });
    if (!group) {
      throw new BadRequestException('Thư viện chưa có trong nhóm');
    }

    const groupId = group._id;

    // Thêm các điều kiện từ `query` và search
    const searchRegex = search
      ? {$regex: search, $options: 'i'} // 'i' để không phân biệt hoa thường
      : null;
    const mongoQuery: any = {isLink: true};
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key) && query[key] !== undefined && query[key] !== null) {
          mongoQuery[key] = query[key];
        }
      });
    }
    if (Object.keys(mongoQuery).includes('libraryId')) {
      mongoQuery.libraryId = new Types.ObjectId(mongoQuery.libraryId);
    }
    const match = {
      ...(searchRegex && {name: searchRegex}),
      ...mongoQuery,
    };

    // truy vấn

    // Xây dựng pipeline với điều kiện `$skip` và `$limit` động
    const pipeline: any[] = [
      {$match: {...match}},
      {
        $lookup: {
          from: 'libraries',
          localField: 'libraryId',
          foreignField: '_id',
          as: 'libraryDetails',
        },
      },
      {
        $unwind: {
          path: '$libraryDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {$match: {'libraryDetails.groupId': {$exists: true, $eq: groupId}}},
      {$sort: {createdAt: order === 'ASC' ? 1 : -1}},
    ];

    // Thêm `$skip` và `$limit` vào pipeline nếu có giá trị
    if (typeof skip === 'number' && skip >= 0) {
      pipeline.push({$skip: skip});
    }
    if (typeof limit === 'number' && limit > 0) {
      pipeline.push({$limit: limit});
    }

    const results = await this.materialModel.aggregate(pipeline);

    // Đếm tổng số tài liệu khớp với điều kiện
    const countPipeline = [
      {$match: {...match}},
      {
        $lookup: {
          from: 'libraries',
          localField: 'libraryId',
          foreignField: '_id',
          as: 'libraryDetails',
        },
      },
      {
        $unwind: {
          path: '$libraryDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {$match: {'libraryDetails.groupId': groupId}},
      {$count: 'totalCount'},
    ];

    const countResult = await this.materialModel.aggregate(countPipeline);
    const itemCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount: itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }
}
