import {MaterialService} from './material.service';
import {CreateMaterialDto} from './dto/create-material.dto';
import {UpdateMaterialDto} from './dto/update-material.dto';

import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req} from '@nestjs/common';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {PageDto} from 'src/utils/page.dto';
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
  create(@Body() createMaterialDto: CreateMaterialDto, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.materialService.create({
      ...createMaterialDto,
      createBy: new Types.ObjectId(user?._id.toString()),
    });
  }

  @Get()
  @Roles(Role.Student) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Material'))
  findAll(@Query() query: Partial<CreateMaterialDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Material>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return this.materialService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }
}
