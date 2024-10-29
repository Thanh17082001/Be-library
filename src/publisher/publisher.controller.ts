import {PublisherService} from './publisher.service';
import {CreatePublisherDto} from './dto/create-publisher.dto';
import {UpdatePublisherDto} from './dto/update-publisher.dto';

import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, BadRequestException} from '@nestjs/common';
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
import {PullLinkDto} from 'src/material/dto/pull-link.dto';

@Controller('publisher')
@ApiTags('publisher')
// @Public()
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async create(@Body() createDto: CreatePublisherDto, @Req() request: Request): Promise<Publisher> {
    const user = request['user'] ?? null;
    createDto.libraryId = !createDto.libraryId ? (new Types.ObjectId(user?.libraryId) ?? null) : createDto.libraryId;
    createDto.createBy = new Types.ObjectId(user?._id) ?? null;
    return await this.publisherService.create({...createDto});
  }

  @Post('pull-link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async pullLink(@Body() pullLinkDto: PullLinkDto, @Req() request: Request) {
    const user = request['user'] ?? null;
    pullLinkDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    pullLinkDto.createBy = new Types.ObjectId(user?.id) ?? null;
    let errors: Array<{row: number; error: string; resource: any}> = [];
    let results: Publisher[] = [];
    if (pullLinkDto.ids.length == 0) {
      throw new BadRequestException('ids is empty');
    }
    for (let i = 0; i < pullLinkDto.ids.length; i++) {
      const id = pullLinkDto.ids[i];
      const resource: Publisher = await this.publisherService.findById(id);
      const createDto: CreatePublisherDto = {
        name: resource.name,
        description: '',
        libraryId: pullLinkDto.libraryId,
        isLink: false,
        createBy: pullLinkDto.createBy,
        isPublic: pullLinkDto.isPublic ? pullLinkDto.isPublic : true,
        note: pullLinkDto.note,
      };
      try {
        const result = await this.publisherService.create({...createDto});
        results.push(result);
      } catch (error) {
        errors.push({row: i + 1, error: error.message, resource});
      }
    }
    return {results, errors};
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAll(@Query() query: Partial<CreatePublisherDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publisher>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    console.log(user?.libraryId);
    console.log(query.libraryId);
    return await this.publisherService.findAll(pageOptionDto, query);
  }

  @Get('link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async lt(@Query() query: Partial<CreatePublisherDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publisher>> {
    const user = request['user'];
    const libraryId = user?.libraryId ?? null;

    return await this.publisherService.GetIsLink(libraryId, pageOptionDto, query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreatePublisherDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publisher>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.publisherService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Publisher>> {
    return await this.publisherService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Publisher>> {
    return await this.publisherService.findOne(id);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<Publisher>> {
    return await this.publisherService.removes(ids);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async deletes(@Body() ids: string[]): Promise<Array<Publisher>> {
    return await this.publisherService.deletes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.publisherService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.publisherService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body() ids: string[]): Promise<Publisher[]> {
    return this.publisherService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publishers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@Param('id') id: string, @Body() updateDto: UpdatePublisherDto): Promise<Publisher> {
    return await this.publisherService.update(id, updateDto);
  }
}
