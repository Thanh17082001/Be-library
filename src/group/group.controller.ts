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
import {Public} from 'src/auth/auth.decorator';

@Controller('group')
@ApiTags('group')
@Public()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Req() request: Request) {
    const user = request['user'];
    const createBy = new Types.ObjectId(user?._id.toString()) ?? null;
    return this.groupService.create({...createGroupDto, createBy: createBy});
  }

  @Get()
  @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permission và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Group'))
  findAll(@Query() query: Partial<CreateGroupDto>, @Query() pageOptionDto: PageOptionsDto): Promise<PageDto<Group>> {
    return this.groupService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateGroupDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Group>> {
    const user = request['user'];
    return await this.groupService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Group>> {
    return await this.groupService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<Group>> {
    return await this.groupService.findOne(id);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.groupService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Group>> {
    return await this.groupService.removes(ids);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.groupService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Group[]> {
    return this.groupService.restoreByIds(ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }
}
