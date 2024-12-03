import {Roles} from './role.decorator';
import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {RoleS} from './entities/role.entity';
import {CreateRoleDto} from './dto/create-role.dto';
import {UpdateRoleDto} from './dto/update-role.dto';
import {PermissonDto} from 'src/user/dto/permission.dto';
import {User} from 'src/user/entities/user.entity';
import {UserService} from 'src/user/user.service';
import {PermissonRoleDto} from './dto/permission-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(RoleS.name) private roleModel: Model<RoleS>,
    @InjectConnection() private readonly connection: Connection
  ) {}
  async create(createDto: CreateRoleDto): Promise<RoleS> {
    return await this.roleModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<RoleS>, superisAdmin: boolean = false): Promise<PageDto<RoleS>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {};

    //search document
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }
    let data = [];

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.roleModel
        .find(mongoQuery)
        // .populate('aaaaaa')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.roleModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    const roleSuperAdmin = ['Owner', 'Super Admin', 'Admin'];
    if (!superisAdmin) {
      data = results.filter(item => !roleSuperAdmin.includes(item.name));
    } else {
      data = results;
    }
    console.log(superisAdmin);
    return new PageDto(data, pageMetaDto);
  }

  async findOne(data: object): Promise<ItemDto<RoleS>> {
    return new ItemDto(await this.roleModel.findOne(data));
  }

  async findByName(name: string): Promise<RoleS> {
    return await this.roleModel.findOne({name: name});
  }

  async findById(id: string): Promise<RoleS> {
    return await this.roleModel.findById(new Types.ObjectId(id));
  }

  async addPermisson(permissionDto: PermissonRoleDto): Promise<RoleS> {
    if (!Types.ObjectId.isValid(permissionDto.roleId)) {
      throw new BadRequestException('role id not valid');
    }

    const role: RoleS = await this.roleModel.findOne({_id: permissionDto.roleId});
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return await this.roleModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(permissionDto.roleId)},
      {
        $set: {
          permissions: permissionDto.permissions,
        },
      },
      {
        returnDocument: 'after',
      }
    );
  }

  async removePermisson(permissionDto: PermissonRoleDto): Promise<RoleS> {
    if (!Types.ObjectId.isValid(permissionDto.roleId)) {
      throw new BadRequestException('role id not valid');
    }

    const role: RoleS = await this.roleModel.findOne({_id: permissionDto.roleId});
    if (!role) {
      throw new NotFoundException('role not found');
    }
    return await this.roleModel.findByIdAndUpdate(
      {_id: new Types.ObjectId(permissionDto.roleId)},
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

  async getCollections(): Promise<string[]> {
    const collections = await this.connection.db.listCollections().toArray();
    return collections.map(collection => collection.name);
  }
}
