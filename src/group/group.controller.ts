import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { PageOptionsDto } from 'src/utils/page-option-dto';
import { PageDto } from 'src/utils/page.dto';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { RolesGuard } from 'src/role/role.guard';
import { CaslGuard } from 'src/casl/casl.guard';
import { CheckPolicies } from 'src/casl/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/casl/casl.action';
import { Request } from 'express';
import { Group } from './entities/group.entity';


@Controller('group')
@ApiTags('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) { }

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.groupService.create({ ...createGroupDto, createBy: new Types.ObjectId(user?._id.toString()) });
  }

  @Get()
  @Roles(Role.User) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Group'))
  findAll(@Query() query: Partial<CreateGroupDto>, @Query() pageOptionDto: PageOptionsDto): Promise<PageDto<Group>> {
    return this.groupService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.groupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}
