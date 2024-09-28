import { Roles } from './role.decorator';
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, ObjectId, Types } from 'mongoose';
import { PageOptionsDto } from 'src/utils/page-option-dto';
import { ItemDto, PageDto } from 'src/utils/page.dto';
import { PageMetaDto } from 'src/utils/page.metadata.dto';
import { RoleS } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissonDto } from 'src/user/dto/permisson.to';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { PermissonRoleDto } from './dto/permisson-role.dto';

@Injectable()
export class RoleService {
    constructor(@InjectModel(RoleS.name) private roleModel: Model<RoleS>, private usersService: UserService,
        @InjectConnection() private readonly connection: Connection) { }
    async create(createDto: CreateRoleDto): Promise<RoleS> {
        return await this.roleModel.create(createDto);
    }

    async findAll(pageOptions: PageOptionsDto, query: Partial<RoleS>): Promise<PageDto<RoleS>> {
        const { page, limit, skip, order, search } = pageOptions;
        const pagination = ['page', 'limit', 'skip', 'order', 'search'];
        const mongoQuery: any = {  };
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
            mongoQuery.name = { $regex: new RegExp(search, 'i') };
        }

        // Thực hiện phân trang và sắp xếp
        const [results, itemCount] = await Promise.all([
            this.roleModel
                .find(mongoQuery)
                // .populate('aaaaaa')
                .sort({ order: 1, createdAt: order === 'ASC' ? 1 : -1 })
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
        return new PageDto(results, pageMetaDto);
    }

    async findOne(id: ObjectId): Promise<ItemDto<RoleS>> {
        return new ItemDto(await this.roleModel.findById(id));
    }

    async addPermisson(permissonDto: PermissonRoleDto): Promise<RoleS> {
        if (!Types.ObjectId.isValid(permissonDto.roleId)) {
            throw new BadRequestException('role id not valid');
        }

        const role: RoleS = await this.roleModel.findOne({ _id: permissonDto.roleId });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return await this.roleModel.findByIdAndUpdate(
            { _id: new Types.ObjectId(permissonDto.roleId) },
            {
                $addToSet: {
                    permissions: { $each: permissonDto.permissons },
                },
            },
            {
                returnDocument: 'after',
            }
        );
    }

    async removePermisson(permissonDto: PermissonRoleDto): Promise<RoleS> {
        if (!Types.ObjectId.isValid(permissonDto.roleId)) {
            throw new BadRequestException('role id not valid');
        }

        const role: RoleS = await this.roleModel.findOne({ _id: permissonDto.roleId });
        if (!role) {
            throw new NotFoundException('role not found');
        }
        return await this.roleModel.findByIdAndUpdate(
            { _id: new Types.ObjectId(permissonDto.roleId) },
            {
                $pull: {
                    permissions: { $each: permissonDto.permissons },
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

