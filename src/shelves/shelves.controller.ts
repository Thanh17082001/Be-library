import {ShelvesService} from './shelves.service';
import {CreateShelfDto} from './dto/create-shelf.dto';
import {UpdateShelfDto} from './dto/update-shelf.dto';
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
import {Shelves} from './entities/shelf.entity';

@Controller('shelves')
@ApiTags('shelves')
@Public()
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post()
  async create(@Body() createDto: CreateShelfDto, @Req() request: Request): Promise<Shelves> {
    const user = request['user'] ?? null;
    return await this.shelvesService.create({...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permission và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Shelves'))
  @Public()
  async findAll(@Query() query: Partial<CreateShelfDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Shelves>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.shelvesService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateShelfDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Shelves>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.shelvesService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Shelves>> {
    return await this.shelvesService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Shelves>> {
    return await this.shelvesService.findOne(id);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Shelves>> {
    return await this.shelvesService.removes(ids);
  }

  @Delete('selected')
  async deleteSelected(@Body() ids: string[]): Promise<Array<Shelves>> {
    return await this.shelvesService.deleteMultiple(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.shelvesService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.shelvesService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Shelves[]> {
    return this.shelvesService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateShelfDto): Promise<Shelves> {
    return await this.shelvesService.update(id, updateDto);
  }
}
