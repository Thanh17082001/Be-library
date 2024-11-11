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
import {Roles} from 'src/role/role.decorator';
import {Role} from 'src/role/role.enum';
import {RolesGuard} from 'src/role/role.guard';

@Controller('request-group')
@ApiTags('request-group')
export class RequestGroupController {
  constructor(private readonly requestGroupService: RequestGroupService) {}

  @Post()
  @Roles(Role.Admin, Role.Owner) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  async create(@Body() createDto: CreateRequestGroupDto, @Req() request: Request): Promise<RequestGroup> {
    const user = request['user'] ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.createBy = new Types.ObjectId(new Types.ObjectId(user?.createBy)) ?? null;
    console.log(createDto);
    return await this.requestGroupService.create({...createDto});
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'requestgroups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAll(@Query() query: Partial<CreateRequestGroupDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<RequestGroup>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.mainLibraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.requestGroupService.findAll(pageOptionDto, query);
  }

  @Get('admin')
  @Roles(Role.Admin, Role.Owner) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  async findAll2(@Query() query: Partial<CreateRequestGroupDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<RequestGroup>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = user.libraryId.toString();
    }
    return await this.requestGroupService.findAll(pageOptionDto, query);
  }

  @Patch(':id')
  @Roles(Role.Owner) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  async update(@Param('id') id: string): Promise<RequestGroup> {
    return await this.requestGroupService.update(id);
  }
}
