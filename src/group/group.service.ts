import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';

import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {Group} from './entities/group.entity';
import {LibraryService} from 'src/library/library.service';
import {SoftDeleteModel} from 'mongoose-delete';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: SoftDeleteModel<Group>,
    readonly libraryService: LibraryService
  ) {}
  async create(createDto: CreateGroupDto): Promise<Group> {
    const libraryIds = createDto.libraries;

    if (!Types.ObjectId.isValid(createDto.mainLibrary)) {
      createDto.mainLibrary = null;
      throw new BadRequestException('Invalid id or miss mainLibrary');
    }

    // Kiểm tra tính hợp lệ và tồn tại của từng libraryId trước khi tạo group
    for (let i = 0; i < libraryIds.length; i++) {
      if (!Types.ObjectId.isValid(libraryIds[i])) {
        throw new BadRequestException('Invalid library id');
      }

      const library = await this.libraryService.findOne(libraryIds[i].toString());
      if (!library) {
        throw new NotFoundException('Library not found');
      }
    }

    // Sau khi kiểm tra xong thì mới tạo group
    const result = await this.groupModel.create(createDto);

    // Cập nhật groupId cho từng library
    for (let i = 0; i < libraryIds.length; i++) {
      const library = await this.libraryService.findOne(libraryIds[i].toString());
      library.result.groupId = new Types.ObjectId(result._id.toString());
      await this.libraryService.update(libraryIds[i].toString(), {
        ...library.result,
      });
    }

    return result;
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Group>, libraryId:string=''): Promise<PageDto<Group>> {
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
    if (libraryId) {
      mongoQuery.libraries = { $in: [libraryId] }; // Tìm kiếm các tài liệu có libraryId trong mảng libraries
    }

    //search document
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }
    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.groupModel
        .find(mongoQuery)
        .populate('libraries')
        .populate('mainLibrary')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.groupModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: string): Promise<ItemDto<Group>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Resource not found');
    }
    const result = await this.groupModel.findById(id).populate('libraries').populate('mainLibrary');

    return new ItemDto(result);
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const exits: Group = await this.groupModel.findOne({
      name: updateGroupDto.name, // Tìm theo tên
      _id: {$ne: new Types.ObjectId(id)}, // Loại trừ ID hiện tại
    });

    if (exits) {
      throw new NotFoundException('name already exists');
    }
    const resource: Group = await this.groupModel.findById(new Types.ObjectId(id));

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    const librariesOld = resource.libraries;

    const librariesNew = updateGroupDto.libraries;

    const result = librariesOld.filter(item => !librariesNew.includes(item)); /// lấy ra phần tử bị loại

    for (let i = 0; i < result.length; i++) {
      const library = await this.libraryService.findById(result[i].toString());
      library.groupId = null;
      await this.libraryService.update(result[i].toString(), {
        ...library,
      });
    }

    for (let i = 0; i < librariesNew.length; i++) {
      const library = await this.libraryService.findById(librariesNew[i].toString());
      library.groupId = new Types.ObjectId(id);
      await this.libraryService.update(librariesNew[i].toString(), {
        ...library,
      });
    }

    return this.groupModel.findByIdAndUpdate(id, updateGroupDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<Group> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Group = await this.groupModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.groupModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<Group>> {
    const arrResult: Group[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Group = await this.groupModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.groupModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<Group>): Promise<PageDto<Group>> {
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
      this.groupModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.groupModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Group>> {
    return new ItemDto(await this.groupModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<Group> {
    const restoredDocument = await this.groupModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<Group[]> {
    const restoredDocuments = await this.groupModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }

    await this.groupModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<Group> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Group = await this.groupModel.findById(new Types.ObjectId(id));
    for (let j = 0; j < resource.libraries.length; j++) {
      const library = await this.libraryService.findById(resource.libraries[j].toString());
      await this.libraryService.updateGroupIdINLibrary(library._id.toString());
    }
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.groupModel?.findByIdAndDelete(new Types.ObjectId(id));
  }
  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    for (let i = 0; i < objectIds.length; i++) {
      const id = objectIds[i];
      const group: Group = await this.groupModel.findById(id);
      for (let j = 0; j < group.libraries.length; j++) {
        const library = await this.libraryService.findById(group.libraries[j].toString());
        await this.libraryService.updateGroupIdINLibrary(library._id.toString());
      }
    }
    return await this.groupModel.deleteMany({
      _id: {$in: objectIds},
    });
  }

  async getLibraries(libraryId: string): Promise<ItemDto<Group>> {
    return new ItemDto(await this.groupModel.findOne({libraries: libraryId}).populate('libraries'));
  }
}
