import {LibraryStockService} from './library-stock.service';
import {CreateLibraryStockDto} from './dto/create-library-stock.dto';
import {UpdateLibraryStockDto} from './dto/update-library-stock.dto';

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
import {LibraryStock} from './entities/library-stock.entity';

@Controller('library-stock')
@ApiTags('library-stock')
export class LibraryStockController {
  constructor(private readonly exampleService: LibraryStockService) {}

  @Post()
  async create(@Body() createDto: CreateLibraryStockDto, @Req() request: Request): Promise<LibraryStock> {
    const user = request['user'] ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.groupId = user?.groupId ?? null;
    return await this.exampleService.create({...createDto});
  }

  @Get()
  @Roles(Role.Student) // tên role để chặn bên dưới
  @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'LibraryStock'))
  async findAll(@Query() query: Partial<CreateLibraryStockDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LibraryStock>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.exampleService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateLibraryStockDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LibraryStock>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.exampleService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<LibraryStock>> {
    return await this.exampleService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<LibraryStock>> {
    return await this.exampleService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.exampleService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<LibraryStock>> {
    return await this.exampleService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.exampleService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.exampleService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<LibraryStock[]> {
    return this.exampleService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateLibraryStockDto): Promise<LibraryStock> {
    return await this.exampleService.update(id, updateDto);
  }
}
