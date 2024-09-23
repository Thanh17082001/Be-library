import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { PageOptionsDto } from 'src/utils/page-option-dto';
import { ItemDto, PageDto } from 'src/utils/page.dto';
import { PageMetaDto } from 'src/utils/page.metadata.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupService {
  constructor(@InjectModel(Group.name) private groupModel: Model<Group>) { }
  async create(createDto: CreateGroupDto): Promise<Group> {
    if (!Types.ObjectId.isValid(createDto.mainLibrary)) {
      createDto.mainLibrary = null
    }
    return await this.groupModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Group>): Promise<PageDto<Group>> {
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
      this.groupModel
        .find()
        // .populate('aaaaaa')
        .sort({ order: 1, createdAt: order === 'ASC' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
      ,
      this.groupModel.countDocuments(),
    ]);

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    return new PageDto(results, pageMetaDto)
  }

  async findOne(id: ObjectId): Promise<ItemDto<Group>> {
    return new ItemDto(await this.groupModel.findById(id));
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id')
    }
    const exits: Group = await this.groupModel.findOne({
      name: updateGroupDto.name,       // Tìm theo tên
      _id: { $ne: new Types.ObjectId(id) }  // Loại trừ ID hiện tại
    });
    if (!exits) {
      throw new NotFoundException('name already exists');
    }
    const resource: Group = await this.groupModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.groupModel.findByIdAndUpdate(id, updateGroupDto, { returnDocument: 'after' });
  }

  async remove(id: string): Promise<Group> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id')
    }
    const resource: Group = await this.groupModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.groupModel.findByIdAndDelete(new Types.ObjectId(id))
  }
}

