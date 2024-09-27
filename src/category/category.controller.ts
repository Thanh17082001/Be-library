import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { PageOptionsDto } from 'src/utils/page-option-dto';
import { ItemDto, PageDto } from 'src/utils/page.dto';
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
import { Public } from 'src/auth/auth.decorator';
import { Category } from './entities/category.entity';


@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  async create(@Body() createDto: CreateCategoryDto, @Req() request: Request):Promise<Category> {
    const user = request['user'] ?? null;
    return await this.categoryService.create({ ...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'example'))
  @Public()
  async findAll(@Query() query: Partial<CreateCategoryDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Category>> {

    const user = request['user'] ;
    query.libraryId = user?.libraryId ?? null
    return await this.categoryService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId):Promise<ItemDto<Category>> {
    return await this.categoryService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto):Promise<Category> {
    return await this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string):Promise<Category> {
    return await this.categoryService.remove(id);
  }
}