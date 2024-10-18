import {CategoryService} from './category.service';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';

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
import {Category} from './entities/category.entity';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@Body() createDto: CreateCategoryDto, @Req() request: Request): Promise<Category> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    createDto.createBy = new Types.ObjectId(user?.userId) ?? null;
    return await this.categoryService.create({...createDto});
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAll(@Query() query: Partial<CreateCategoryDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Category>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.categoryService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAllDeleted(@Query() query: Partial<CreateCategoryDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Category>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.categoryService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Category>> {
    return await this.categoryService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Category>> {
    return await this.categoryService.findOne(id);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  deleteSelected(@Body() ids: string[]) {
    return this.categoryService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async removes(@Body() ids: string[]): Promise<Array<Category>> {
    return await this.categoryService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async restoreByIds(@Body() ids: string[]): Promise<Category[]> {
    return this.categoryService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'categories')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto): Promise<Category> {
    return await this.categoryService.update(id, updateDto);
  }
}
