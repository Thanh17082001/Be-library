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
// @Public()
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async create(@Body() createDto: CreateShelfDto, @Req() request: Request): Promise<Shelves> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    createDto.createBy = new Types.ObjectId(user?.userId) ?? null;
    return await this.shelvesService.create({...createDto});
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAll(@Query() query: Partial<CreateShelfDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Shelves>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.shelvesService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreateShelfDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Shelves>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.shelvesService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Shelves>> {
    return await this.shelvesService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Shelves>> {
    return await this.shelvesService.findOne(id);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<Shelves>> {
    return await this.shelvesService.removes(ids);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async deleteSelected(@Body() ids: string[]): Promise<Array<Shelves>> {
    return await this.shelvesService.deleteMultiple(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.shelvesService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.shelvesService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body() ids: string[]): Promise<Shelves[]> {
    return this.shelvesService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'shelves')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@Param('id') id: string, @Body() updateDto: UpdateShelfDto): Promise<Shelves> {
    return await this.shelvesService.update(id, updateDto);
  }
}
