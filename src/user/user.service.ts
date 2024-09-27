import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectModel} from '@nestjs/mongoose';
import {User} from './entities/user.entity';
import {Model, ObjectId, Types} from 'mongoose';
import {PermissonDto} from './dto/permisson.to';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const password = await bcrypt.hash(createUserDto.password, 10);
    const user: CreateUserDto = {
      ...createUserDto,
      password: password,
    };
    const result = await this.userModel.create(user);
    result.password = undefined;
    return result;
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<User>): Promise<PageDto<User>> {
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
    console.log(search);
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.userModel
        .find(mongoQuery)
        // .populate('aaaaaa')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findById(id: Types.ObjectId): Promise<ItemDto<User>> {
    return new ItemDto(await this.userModel.findById(id));
  }

  async findOne(data: any): Promise<User> {
    return await this.userModel.findOne(data).lean();
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const exits: User = await this.userModel.findOne({
      email: updateDto.email, // Tìm theo tên
      _id: {$ne: new Types.ObjectId(id)}, // Loại trừ ID hiện tại
    });
    if (exits) {
      throw new BadRequestException('email already exists');
    }
    const resource: User = await this.userModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (updateDto.avatar) {
      console.log(path.join(__dirname, '..', '..', 'public', resource.avatar));
      const oldImagePath = path.join(__dirname, '..', '..', 'public', resource.avatar);
      fs.unlinkSync(oldImagePath);
    }
    return this.userModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: User = await this.userModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.userModel.findByIdAndDelete(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<User>> {
    const arrResult: User[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: User = await this.userModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.userModel.findByIdAndDelete(id);
      arrResult.push(result);
    }
    return arrResult;
  }
  async addPermisson(permissonDto: PermissonDto): Promise<User> {
    if (!Types.ObjectId.isValid(permissonDto.userId)) {
      throw new BadRequestException('User id not valid');
    }

    const user: User = await this.userModel.findOne({_id: permissonDto.userId});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(permissonDto.userId)},
      {
        $addToSet: {
          permissions: permissonDto.permissons,
        },
      },
      {
        returnDocument: 'after',
      }
    );
  }

  async removePermisson(permissonDto: PermissonDto): Promise<User> {
    if (!Types.ObjectId.isValid(permissonDto.userId)) {
      throw new BadRequestException('User id not valid');
    }

    const user: User = await this.userModel.findOne({_id: permissonDto.userId});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(permissonDto.userId)},
      {
        $pull: {
          permissions: permissonDto.permissons,
        },
      },
      {
        returnDocument: 'after',
      }
    );
  }
}
