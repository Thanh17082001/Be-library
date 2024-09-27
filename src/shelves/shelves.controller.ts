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
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Shelves'))
  @Public()
  async findAll(@Query() query: Partial<CreateShelfDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Shelves>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.shelvesService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Shelves>> {
    return await this.shelvesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateShelfDto): Promise<Shelves> {
    return await this.shelvesService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Shelves> {
    return await this.shelvesService.remove(id);
  }
}
