import {PublisherService} from './publisher.service';
import {CreatePublisherDto} from './dto/create-publisher.dto';
import {UpdatePublisherDto} from './dto/update-publisher.dto';

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
import {Publisher} from './entities/publisher.entity';

@Controller('publisher')
@ApiTags('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post()
  async create(@Body() createDto: CreatePublisherDto, @Req() request: Request): Promise<Publisher> {
    const user = request['user'] ?? null;
    return await this.publisherService.create({...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Publisher'))
  @Public()
  async findAll(@Query() query: Partial<CreatePublisherDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publisher>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.publisherService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Publisher>> {
    return await this.publisherService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePublisherDto): Promise<Publisher> {
    return await this.publisherService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Publisher> {
    return await this.publisherService.remove(id);
  }
}