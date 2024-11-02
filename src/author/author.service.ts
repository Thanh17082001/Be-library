import {CreateAuthorDto} from './dto/create-author.dto';
import {UpdateAuthorDto} from './dto/update-author.dto';
import {Injectable, NotFoundException, BadRequestException, HttpException, Query} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {Author} from './entities/author.entity';
import {SoftDeleteModel} from 'mongoose-delete';
import {Group} from 'src/group/entities/group.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(Author.name) private exampleModel: SoftDeleteModel<Author>,
    @InjectModel(Group.name) private groupModel: SoftDeleteModel<Group>
  ) {}
  async create(createDto: CreateAuthorDto): Promise<Author> {
    const author: Author = await this.exampleModel.findOne({name: createDto.name, libraryId: createDto.libraryId});
    if (author) {
      throw new BadRequestException('name already exists');
    }
    createDto.name = createDto.name.toLowerCase();
    return await this.exampleModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Author>): Promise<PageDto<Author>> {
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

  async findOne(id: ObjectId): Promise<ItemDto<Author>> {
    return new ItemDto(await this.exampleModel.findById(id));
  }

  async findById(id: string): Promise<Author> {
    return await this.exampleModel.findById(id);
  }

  async findByName(names: Array<string>, libraryId: string): Promise<Array<Types.ObjectId>> {
    const resources = await this.exampleModel
      .find({name: {$in: names}, libraryId: new Types.ObjectId(libraryId)}) // Chỉ lấy trường _id
      .lean(); // Trả về dữ liệu đơn giản, không phải mongoose document

    // Trả về mảng các ObjectId
    return resources.map(item => item._id);
  }

  async update(id: string, updateDto: UpdateAuthorDto): Promise<Author> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const exits: Author = await this.exampleModel.findOne({
      name: updateDto.name, // Tìm theo tên
      libraryId: new Types.ObjectId(updateDto.libraryId),
      _id: {$ne: new Types.ObjectId(id)}, // Loại trừ ID hiện tại
    });
    if (exits) {
      throw new BadRequestException('name already exists');
    }
    const resource: Author = await this.exampleModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (updateDto.name) {
      updateDto.name = updateDto.name.toLowerCase();
    }
    return this.exampleModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<Author> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Author = await this.exampleModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.exampleModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<Author>> {
    const arrResult: Author[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Author = await this.exampleModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.exampleModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<Author>): Promise<PageDto<Author>> {
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

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Author>> {
    return new ItemDto(await this.exampleModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreByIds(ids: string[]): Promise<Author[]> {
    const restoredDocuments = await this.exampleModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.exampleModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<Author> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Author = await this.exampleModel.findOneDeleted({_id: new Types.ObjectId(id)});
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
  //liên thông
  async GetIsLink(libraryId: string, pageOptions: PageOptionsDto, query: Partial<Author>): Promise<any> {
    const {page, limit, skip, order, search} = pageOptions;
    const group = await this.groupModel.findOne({
      libraries: {$in: [libraryId]},
    });
    if (!group) {
      throw new Error('Không tìm thấy groupId cho libraryId này');
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
        if (key && !pagination.includes(key)) {
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

    const results = await this.exampleModel.aggregate([
      {
        $match: {
          ...match,
        },
      },

      {
        $lookup: {
          from: 'libraries', // Tên của collection thư viện
          localField: 'libraryId', // Trường libraryId của bảng ấn phẩm
          foreignField: '_id', // Trường _id của bảng thư viện
          as: 'libraryDetails', // Tên trường chứa dữ liệu kết nối
        },
      },

      {
        $unwind: {
          path: '$libraryDetails',
          preserveNullAndEmptyArrays: true, // Giữ lại tài liệu nếu abc là null hoặc không tồn tại
        },
      },

      {
        $match: {
          'libraryDetails.groupId': groupId, // Điều kiện groupId
        },
      },
      {
        $sort: {createdAt: order === 'ASC' ? 1 : -1}, // Sắp xếp theo createdAt
      },
      {
        $skip: skip, // Bỏ qua các tài liệu đã phân trang
      },
      {
        $limit: limit, // Giới hạn số tài liệu trả về
      },
    ]);

    // Đếm tổng số tài liệu khớp với điều kiện
    const countResult = await this.exampleModel.aggregate([
      {
        $match: {
          ...match,
        },
      },
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
      {
        $match: {
          'libraryDetails.groupId': groupId,
        },
      },
      {
        $count: 'totalCount', // Đếm số tài liệu
      },
    ]);

    const itemCount = countResult.length > 0 ? countResult[0].totalCount : 0;
    console.log(itemCount);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount: itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }
}
