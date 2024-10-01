import {AssetService} from './asset.service';
import {CreateAssetDto} from './dto/create-asset.dto';
import {UpdateAssetDto} from './dto/update-asset.dto';

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
import {Asset} from './entities/asset.entity';

@Controller('asset')
@ApiTags('asset')
@Public()
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  async create(@Body() createDto: CreateAssetDto, @Req() request: Request): Promise<Asset> {
    const user = request['user'] ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.groupId = user?.groupId ?? null;
    createDto.quantity = +createDto.quantity;
    return await this.assetService.create({...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Asset'))
  async findAll(@Query() query: Partial<CreateAssetDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Asset>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    query.quantity = +query.quantity;
    return await this.assetService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateAssetDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Asset>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.assetService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Asset>> {
    return await this.assetService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<Asset>> {
    return await this.assetService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.assetService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Asset>> {
    return await this.assetService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.assetService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Asset[]> {
    return this.assetService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateAssetDto): Promise<Asset> {
    return await this.assetService.update(id, updateDto);
  }
}
