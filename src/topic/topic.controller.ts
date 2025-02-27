import {TopicService} from './topic.service';
import {CreateTopicDto} from './dto/create-topic.dto';
import {UpdateTopicDto} from './dto/update-topic.dto';

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
import {Public} from 'src/auth/auth.decorator';
import {Topic} from './entities/topic.entity';

@Controller('topic')
@ApiTags('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'topics')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@Body() createDto: CreateTopicDto, @Req() request: Request): Promise<Topic> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(new Types.ObjectId(user?.libraryId)) ?? null;
    return await this.topicService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'topics')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'example'))
  async findAll(@Query() query: Partial<CreateTopicDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Topic>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.topicService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<Topic>> {
    return await this.topicService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.topicService.deleteMultiple(ids);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.topicService.delete(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateTopicDto): Promise<Topic> {
    return await this.topicService.update(id, updateDto);
  }
}
