import {GroupService} from './group.service';
import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';

import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req} from '@nestjs/common';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {ApiTags} from '@nestjs/swagger';
import {ObjectId, Types} from 'mongoose';
import {Roles} from 'src/role/role.decorator';
import {Role} from 'src/role/role.enum';
import {RolesGuard} from 'src/role/role.guard';
import {CaslGuard} from 'src/casl/casl.guard';
import {CheckPolicies} from 'src/casl/check-policies.decorator';
import {AppAbility} from 'src/casl/casl-ability.factory/casl-ability.factory';
import {Action} from 'src/casl/casl.action';
import {Request} from 'express';
import {Group} from './entities/group.entity';
import {LibraryService} from 'src/library/library.service';
import {Library} from 'src/library/entities/library.entity';
import {LeaveGroupDto} from './dto/leave-group.dto';

@Controller('group')
@ApiTags('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly libraryService: LibraryService
  ) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  create(@Body() createGroupDto: CreateGroupDto, @Req() request: Request) {
    const user = request['user'];
    const createBy = new Types.ObjectId(user?._id.toString()) ?? null;
    return this.groupService.create({...createGroupDto, createBy: createBy});
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard) // chặn role (admin, student ,....)
  async findAll(@Query() query: Partial<CreateGroupDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Group>> {
    const user = request['user'];
    const library: Library = await this.libraryService.findById(user.libraryId);
    if (library.groupId) {
      return await this.groupService.findAll(pageOptionDto, query, user.libraryId.toString());
    }
    return await this.groupService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAllDeleted(@Query() query: Partial<CreateGroupDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Group>> {
    const user = request['user'];
    return await this.groupService.findDeleted(pageOptionDto, query);
  }

  @Get('/libraries')
  @Roles(Role.Admin, Role.Teacher, Role.Owner) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  async findAllLibrary(@Req() request: Request): Promise<ItemDto<Group>> {
    const user = request['user'];
    const libraryId = user.libraryId;
    return await this.groupService.getLibraries(libraryId);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Group>> {
    return await this.groupService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOne(@Param('id') id: string): Promise<ItemDto<Group>> {
    return await this.groupService.findOne(id);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  deleteSelected(@Body() ids: string[]) {
    return this.groupService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async removes(@Body() ids: string[]): Promise<Array<Group>> {
    return await this.groupService.removes(ids);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  delete(@Param('id') id: string) {
    return this.groupService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async restoreByIds(@Body() ids: string[]): Promise<Group[]> {
    return this.groupService.restoreByIds(ids);
  }

  @Patch('leave')
  @Roles(Role.Admin, Role.Owner) // tên role để chặn bên dưới
  @UseGuards(RolesGuard)
  updateLeave(@Req() request: Request) {
    const user = request['user'];
    const libraryId = user.libraryId;
    return this.groupService.updateLeave(libraryId);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'groups')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }
}
