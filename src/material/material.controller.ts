import {diskStorage} from 'multer';
import {MaterialService} from './material.service';
import {CreateMaterialDto} from './dto/create-material.dto';
import {UpdateMaterialDto} from './dto/update-material.dto';

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
import {Material} from './entities/material.entity';

@Controller('material')
@ApiTags('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  create(@Body() createMaterialDto: CreateMaterialDto, @Req() request: Request) {
    const user = request['user'] ?? null;
    createMaterialDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    createMaterialDto.createBy = new Types.ObjectId(user?.id) ?? null;
    return this.materialService.create({
      ...createMaterialDto,
    });
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  findAll(@Query() query: Partial<CreateMaterialDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Material>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return this.materialService.findAll(pageOptionDto, query);
  }

  @Get('link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async lt(@Query() query: Partial<CreateMaterialDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Material>> {
    const user = request['user'];
    const libraryId = user?.libraryId ?? null;

    return await this.materialService.GetIsLink(libraryId, pageOptionDto);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreateMaterialDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Material>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.materialService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Material>> {
    return await this.materialService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  findOne(@Param('id') id: ObjectId) {
    return this.materialService.findOne(id);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  deleteSelected(@Body() ids: string[]) {
    return this.materialService.deletes(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<Material>> {
    return await this.materialService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.materialService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body() ids: string[]): Promise<Material[]> {
    return this.materialService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateMaterialDto);
  }
}
