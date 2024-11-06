import {SoftDeleteModel} from 'mongoose-delete';
import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateRequestGroupDto} from './dto/create-request-group.dto';
import {UpdateRequestGroupDto} from './dto/update-request-group.dto';
import {InjectModel} from '@nestjs/mongoose';
import {RequestGroup} from './entities/request-group.entity';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {GroupService} from 'src/group/group.service';
import {Group} from 'src/group/entities/group.entity';
import {LibraryService} from 'src/library/library.service';

@Injectable()
export class RequestGroupService {
  constructor(
    @InjectModel(RequestGroup.name) private requestGroupModel: SoftDeleteModel<RequestGroup>,
    private readonly groupService: GroupService,
    private readonly libraryService: LibraryService
  ) {}
  async create(createDto: CreateRequestGroupDto): Promise<RequestGroup> {
    const group: Group = (await this.groupService.findOne(createDto.groupId.toString())).result;
    const data: CreateRequestGroupDto = {
      createBy: new Types.ObjectId(createDto.createBy) ?? null,
      libraryId: createDto.libraryId,
      mainLibraryId: new Types.ObjectId(group.mainLibrary._id.toString()),
      groupId: new Types.ObjectId(createDto.groupId),
      isAgree: false,
    };
    const exits = await this.requestGroupModel.findOne({
      libraryId: data.libraryId,
      groupId: data.groupId,
    });
    if (exits) {
      throw new BadRequestException('Yêu cầu đã được gửi');
    }
    return await this.requestGroupModel.create(data);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<CreateRequestGroupDto>): Promise<PageDto<RequestGroup>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {isAgree: false};
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
      this.requestGroupModel
        .find(mongoQuery)
        .populate('libraryId')
        .populate('groupId')
        // .populate('createBy')
        .populate('mainLibraryId')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.requestGroupModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<RequestGroup>> {
    return new ItemDto(await this.requestGroupModel.findById(id));
  }

  async update(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const resource: RequestGroup = await this.requestGroupModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.isAgree) {
      throw new BadRequestException('resource is agree');
    }

    const group: Group = await this.groupService.findById(resource.groupId.toString());

    const library = await this.libraryService.findById(resource.libraryId.toString());
    const libraries = [resource.libraryId, ...group.libraries];
    await this.groupService.update(resource.groupId.toString(), {libraries: libraries});
    library.groupId = new Types.ObjectId(resource.groupId);
    await this.libraryService.update(resource.libraryId.toString(), {
      ...library,
    });
    const update = await this.requestGroupModel.findByIdAndUpdate(
      id,
      {isAgree: true},
      {
        returnDocument: 'after',
      }
    );

    await this.requestGroupModel?.findByIdAndDelete(new Types.ObjectId(id));
    return update;
  }

  remove(id: number) {
    return `This action removes a #${id} requestGroup`;
  }
}
