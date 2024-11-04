import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query} from '@nestjs/common';
import {RequestGroupService} from './request-group.service';
import {CreateRequestGroupDto} from './dto/create-request-group.dto';
import {UpdateRequestGroupDto} from './dto/update-request-group.dto';
import {CheckPolicies} from 'src/casl/check-policies.decorator';
import {AppAbility} from 'src/casl/casl-ability.factory/casl-ability.factory';
import {CaslGuard} from 'src/casl/casl.guard';
import {Types} from 'mongoose';
import {RequestGroup} from './entities/request-group.entity';
import {Action} from 'src/casl/casl.action';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {ApiTags} from '@nestjs/swagger';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { RolesGuard } from 'src/role/role.guard';

@Controller('request-group')
@ApiTags('request-group')
export class RequestGroupController {
  constructor(private readonly requestGroupService: RequestGroupService) {}

  @Post()
    @Roles(Role.Admin) // tên role để chặn bên dưới
    @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  async create(@Body() createDto: CreateRequestGroupDto, @Req() request: Request): Promise<RequestGroup> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(new Types.ObjectId(user?.libraryId)) ?? null;
    createDto.createBy = new Types.ObjectId(new Types.ObjectId(user?.createBy)) ?? null;
    console.log(createDto);
    return await this.requestGroupService.create({...createDto});
  }

  @Get()
  @Roles(Role.Owner) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'example'))
  async findAll(@Query() query: Partial<CreateRequestGroupDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<RequestGroup>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.mainLibraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    console.log(query);
    return await this.requestGroupService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<RequestGroup>> {
    return await this.requestGroupService.findOne(new Types.ObjectId(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestGroupDto: UpdateRequestGroupDto) {
    return this.requestGroupService.update(+id, updateRequestGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestGroupService.remove(+id);
  }
}
