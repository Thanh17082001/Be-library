import {TypeVoiceService} from './type-voice.service';
import {CreateTypeVoiceDto} from './dto/create-type-voice.dto';
import {UpdateTypeVoiceDto} from './dto/update-type-voice.dto';

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
import {TypeVoice} from './entities/type-voice.entity';

@Controller('type-voice')
@ApiTags('type-voice')
export class TypeVoiceController {
  constructor(private readonly typeVoiceService: TypeVoiceService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'examples')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@Body() createDto: CreateTypeVoiceDto, @Req() request: Request): Promise<TypeVoice> {
    const user = request['user'] ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.groupId = user?.groupId ?? null;
    return await this.typeVoiceService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'examples')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'TypeVoice'))
  async findAll(@Query() query: Partial<CreateTypeVoiceDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<TypeVoice>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.typeVoiceService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateTypeVoiceDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<TypeVoice>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.typeVoiceService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<TypeVoice>> {
    return await this.typeVoiceService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<TypeVoice>> {
    return await this.typeVoiceService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.typeVoiceService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<TypeVoice>> {
    return await this.typeVoiceService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.typeVoiceService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.typeVoiceService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<TypeVoice[]> {
    return this.typeVoiceService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateTypeVoiceDto): Promise<TypeVoice> {
    return await this.typeVoiceService.update(id, updateDto);
  }
}
