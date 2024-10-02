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
    createMaterialDto.libraryId = user?.libraryId ?? null;
    createMaterialDto.createBy = user?._id ?? null;
    createMaterialDto.groupId = user?.groupId ?? null;
    return this.materialService.create({
      ...createMaterialDto,
    });
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Material'))
  findAll(@Query() query: Partial<CreateMaterialDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Material>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return this.materialService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateMaterialDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Material>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.materialService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Material>> {
    return await this.materialService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.materialService.findOne(id);
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.materialService.deletes(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Material>> {
    return await this.materialService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.materialService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Material[]> {
    return this.materialService.restoreByIds(ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateMaterialDto);
  }
}
