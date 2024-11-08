import {LibraryService} from './library.service';
import {CreateLibraryDto} from './dto/create-library.dto';
import {UpdateLibraryDto} from './dto/update-library.dto';

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
import {Library} from './entities/library.entity';
import {Public} from 'src/auth/auth.decorator';

@Controller('library')
@ApiTags('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  create(@Body() createLibraryDto: CreateLibraryDto, @Req() request: Request) {
    createLibraryDto.maxStorageLimit = createLibraryDto.maxStorageLimit * 1024;
    createLibraryDto.totalStorageUsed = 0;
    return this.libraryService.create(createLibraryDto);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  findAll(@Query() query: Partial<CreateLibraryDto>, @Query() pageOptionDto: PageOptionsDto): Promise<PageDto<Library>> {
    return this.libraryService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAllDeleted(@Query() query: Partial<CreateLibraryDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Library>> {
    const user = request['user'];
    return await this.libraryService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Library>> {
    return await this.libraryService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  findOne(@Param('id') id: string) {
    return this.libraryService.findOne(id);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  deleteSelected(@Body() ids: string[]) {
    return this.libraryService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async removes(@Body() ids: string[]): Promise<Array<Library>> {
    return await this.libraryService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  remove(@Param('id') id: string) {
    return this.libraryService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  delete(@Param('id') id: string) {
    return this.libraryService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async restoreByIds(@Body() ids: string[]): Promise<Library[]> {
    return this.libraryService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'libraries')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  update(@Param('id') id: string, @Body() updateLibraryDto: UpdateLibraryDto) {
    return this.libraryService.update(id, updateLibraryDto);
  }
}
