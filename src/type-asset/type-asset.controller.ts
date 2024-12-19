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
import {TypeAssetService} from './type-asset.service';
import {CreateTypeAssetDto} from './dto/create-type-asset.dto';
import {TypeAsset} from './entities/type-asset.entity';
import {UpdateTypeAssetDto} from './dto/update-type-asset.dto';

@Controller('type-asset')
@ApiTags('type-asset')
@Public()
export class TypeAssetController {
  constructor(private readonly typeAssetService: TypeAssetService) {}

  @Post()
  async create(@Body() createDto: CreateTypeAssetDto, @Req() request: Request): Promise<TypeAsset> {
    return await this.typeAssetService.create({...createDto});
  }

  @Get()
  async findAll(@Query() query: Partial<CreateTypeAssetDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<TypeAsset>> {
    return await this.typeAssetService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateTypeAssetDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<TypeAsset>> {
    return await this.typeAssetService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<TypeAsset>> {
    return await this.typeAssetService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<TypeAsset>> {
    return await this.typeAssetService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.typeAssetService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<TypeAsset>> {
    return await this.typeAssetService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.typeAssetService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.typeAssetService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<TypeAsset[]> {
    return this.typeAssetService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateTypeAssetDto): Promise<TypeAsset> {
    return await this.typeAssetService.update(id, updateDto);
  }
}
