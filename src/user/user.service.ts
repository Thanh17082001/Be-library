import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectModel} from '@nestjs/mongoose';
import {User} from './entities/user.entity';
import {Model, ObjectId, Types} from 'mongoose';
import {PermissonDto} from './dto/permission.dto';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import {generateUserName} from 'src/common/genegrate-name-user';
import {generateRandomPassword} from 'src/common/generate-pass';
import {generateRandomData} from 'src/common/genegrate-barcode';
import {RoleService} from 'src/role/role.service';
import {RoleS} from 'src/role/entities/role.entity';
import {SoftDeleteModel} from 'mongoose-delete';
import {Role} from 'src/role/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<User>,
    private roleService: RoleService
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const roleEnum = Role.Student;
    createUserDto.username = generateUserName(createUserDto.fullname, createUserDto.birthday);
    createUserDto.password = generateRandomPassword(8);
    const password = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.barcode = generateRandomData();
    console.log(createUserDto.email);
    const userExits = await this.userModel.findOne({
      $or: [{username: createUserDto.username}, {email: createUserDto.email}],
    });

    if (!!userExits) {
      throw new BadRequestException('Username or email already exists');
    }

    const roleId = createUserDto.roleId;
    let role: RoleS = await this.roleService.findById(roleId.toString());
    if (!role) {
      role = (await this.roleService.findOne({name: roleEnum})).result;
    }

    const user = {
      ...createUserDto,
      permissions: role.permissions,
      roleId: new Types.ObjectId(roleId),
      avatar: createUserDto.avatar != '' ? createUserDto.avatar : '/default/68e1d8178e17d7d962ec9db4fae3eabc.jpg',
      passwordFirst: createUserDto.password,
      password: password,
    };

    const result = await this.userModel.create(user);
    result.password = undefined;
    result.passwordFirst = undefined;
    return result;
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<User>): Promise<PageDto<User>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {isActive: 1, isAdmin: false};
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
      this.userModel
        .find(mongoQuery)
        .select(['-password', '-passwordFirst'])
        .populate('roleId')
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
    return new ItemDto(await this.userModel.findById(id).select(['-password', '-passwordFirst']).lean());
  }

  async findByBarcode(barcode: string): Promise<ItemDto<User>> {
    return new ItemDto(await this.userModel.findOne({barcode: barcode}).select(['-password', '-passwordFirst']).populate('roleId').lean());
  }

  async findOne(data: any): Promise<User> {
    return await this.userModel.findOne(data).populate('roleId').lean();
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

    if (updateDto.avatar && resource.avatar) {
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
    return await this.userModel?.deleteById(new Types.ObjectId(id));
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
      const result = await this.userModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<User>): Promise<PageDto<User>> {
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
      this.userModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.userModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<User>> {
    return new ItemDto(await this.userModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreByIds(ids: string[]): Promise<User[]> {
    const restoredDocuments = await this.userModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.userModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async addPermisson(permissionDto: PermissonDto): Promise<User> {
    if (!Types.ObjectId.isValid(permissionDto.userId)) {
      throw new BadRequestException('User id not valid');
    }

    const user: User = await this.userModel.findOne({_id: permissionDto.userId});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(permissionDto.userId)},
      {
        $addToSet: {
          permissions: {$each: permissionDto.permissions},
        },
      },
      {
        returnDocument: 'after',
      }
    );
  }

  async removePermisson(permissionDto: PermissonDto): Promise<User> {
    if (!Types.ObjectId.isValid(permissionDto.userId)) {
      throw new BadRequestException('User id not valid');
    }

    const user: User = await this.userModel.findOne({_id: permissionDto.userId});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(permissionDto.userId)},
      {
        $pull: {
          permissions: {$each: permissionDto.permissions},
        },
      },
      {
        returnDocument: 'after',
      }
    );
  }
}
