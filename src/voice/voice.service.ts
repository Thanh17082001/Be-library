import {CreateVoiceDto} from './dto/create-voice.dto';
import {UpdateVoiceDto} from './dto/update-voice.dto';
import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {SoftDeleteModel} from 'mongoose-delete';
import {Voice} from './entities/voice.entity';
import * as path from 'path';
import {existsSync, unlinkSync, promises as fs} from 'fs';
import {Group} from 'src/group/entities/group.entity';

@Injectable()
export class VoiceService {
  constructor(
    @InjectModel(Voice.name) private voiceModel: SoftDeleteModel<Voice>,
    @InjectModel(Group.name) private groupModel: SoftDeleteModel<Group>
  ) {}
  async create(createDto: CreateVoiceDto): Promise<Voice> {
    const voice: Voice = await this.voiceModel.findOne({name: createDto.name, isPrivate: createDto.isPrivate, publicationId: createDto.publicationId, typeVoiceId: createDto.typeVoiceId});
    if (voice) {
      throw new HttpException('Voice already exists', 400);
    }
    return await this.voiceModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Voice>): Promise<PageDto<Voice>> {
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
      this.voiceModel
        .find(mongoQuery)
        .populate('publicationId')
        .populate('typeVoiceId')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.voiceModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<Voice>> {
    return new ItemDto(await this.voiceModel.findById(id));
  }

  async update(id: string, updateDto: UpdateVoiceDto): Promise<Voice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const resource: Voice = await this.voiceModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    const exits: Voice = await this.voiceModel.findOne({
      name: updateDto.name,
      isPrivate: updateDto.isPrivate,
      publicationId: updateDto.publicationId,
      typeVoiceId: updateDto.typeVoiceId, // Tìm theo tên
      _id: {$ne: new Types.ObjectId(id)}, // Loại trừ ID hiện tại
    });
    if (exits) {
      throw new BadRequestException('name already exists');
    }
    if (updateDto.path) {
      const oldImagePath = path.join(__dirname, '..', '..', 'public', resource.path);
      if (existsSync(oldImagePath)) {
        unlinkSync(oldImagePath);
      }
    } else {
      updateDto.path = resource.path;
    }
    return this.voiceModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<Voice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Voice = await this.voiceModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.voiceModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<Voice>> {
    const arrResult: Voice[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Voice = await this.voiceModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.voiceModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<Voice>): Promise<PageDto<Voice>> {
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
      this.voiceModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .populate('publicationId')
        .populate('typeVoiceId')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.voiceModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Voice>> {
    return new ItemDto(await this.voiceModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<Voice> {
    const restoredDocument = await this.voiceModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<Voice[]> {
    const restoredDocuments = await this.voiceModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.voiceModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<Voice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Voice = await this.voiceModel.findOneDeleted(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const result = await this.voiceModel?.findByIdAndDelete(new Types.ObjectId(id));
    const oldIPath = path.join(__dirname, '..', '..', 'public', resource.path);
    if (existsSync(oldIPath)) {
      unlinkSync(oldIPath);
    }
    return result;
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    for (let i = 0; i < objectIds.length; i++) {
      const id = objectIds[i];
      const resource: Voice = await this.voiceModel.findOneDeleted(new Types.ObjectId(id));
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const oldIPath = path.join(__dirname, '..', '..', 'public', resource.path);
      if (existsSync(oldIPath)) {
        unlinkSync(oldIPath);
      }
    }
    const result = await this.voiceModel.deleteMany({
      _id: {$in: objectIds},
    });
    return result;
  }

  //liên thông
  async GetIsLink(libraryId: string, pageOptions: PageOptionsDto): Promise<any> {
    const {page, limit, skip, order} = pageOptions;
    const group = await this.groupModel.findOne({
      libraries: {$in: [libraryId]},
    });
    if (!group) {
      throw new Error('Không tìm thấy groupId cho libraryId này');
    }

    const groupId = group._id;
    const results = await this.voiceModel.aggregate([
      {
        $match: {
          isLink: true,
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
    const countResult = await this.voiceModel.aggregate([
      {
        $match: {
          isLink: true,
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
