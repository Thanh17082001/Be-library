import {SoftDeleteModel} from 'mongoose-delete';
import {Injectable} from '@nestjs/common';
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

@Injectable()
export class RequestGroupService {
  constructor(
    @InjectModel(RequestGroup.name) private requestGroupModel: SoftDeleteModel<RequestGroup>,
    private readonly groupService: GroupService
  ) {}
  async create(createDto: CreateRequestGroupDto): Promise<RequestGroup> {
    const group: Group = (await this.groupService.findOne(createDto.groupId.toString())).result;
    console.log(group);
    const data: CreateRequestGroupDto = {
      createBy: new Types.ObjectId(createDto.createBy) ?? null,
      libraryId: new Types.ObjectId(createDto.libraryId),
      mainLibraryId: new Types.ObjectId(group.mainLibrary._id.toString()),
      groupId: new Types.ObjectId(createDto.groupId),
      isAgree: false,
    };
    return await this.requestGroupModel.create(data);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<RequestGroup>): Promise<PageDto<RequestGroup>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {isAgree:false};
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
    console.log(mongoQuery);

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.requestGroupModel
        .find(mongoQuery)
        // .populate('aaaaaa')
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

  update(id: number, updateRequestGroupDto: UpdateRequestGroupDto) {
    return `This action updates a #${id} requestGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} requestGroup`;
  }
}
