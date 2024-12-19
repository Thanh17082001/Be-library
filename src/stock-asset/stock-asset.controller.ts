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
import {StockAssetService} from './stock-asset.service';
import {StockAsset} from './entities/stock-asset.entity';
import {CreateStockAssetDto} from './dto/create-stock-asset.dto';
import {UpdateStockAssetDto} from './dto/update-stock-asset.dto';

@Controller('stock-asset')
@ApiTags('stock-asset')
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'stockassets')) // tên permission và bảng cần chặn
@UseGuards(CaslGuard)
export class StockAssetController {
  constructor(private readonly stockAssetService: StockAssetService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@Body() createDto: CreateStockAssetDto, @Req() request: Request): Promise<StockAsset> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    createDto.createBy = user?._id ?? null;
    return await this.stockAssetService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'StockAsset'))
  async findAll(@Query() query: Partial<CreateStockAssetDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<StockAsset>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.stockAssetService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAllDeleted(@Query() query: Partial<CreateStockAssetDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<StockAsset>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.stockAssetService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<StockAsset>> {
    return await this.stockAssetService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOne(@Param('id') id: string): Promise<ItemDto<StockAsset>> {
    return await this.stockAssetService.findOne(new Types.ObjectId(id));
  }

  // @Get('accept/:id')
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'StockAssets')) // tên permission và bảng cần chặn
  // @UseGuards(CaslGuard)
  // async acceptWarehouse(@Param('id') id: string): Promise<StockAsset> {
  //   return await this.stockAssetService.accept(id);
  // }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  deleteSelected(@Body() ids: string[]) {
    return this.stockAssetService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async removes(@Body() ids: string[]): Promise<Array<StockAsset>> {
    return await this.stockAssetService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  remove(@Param('id') id: string) {
    return this.stockAssetService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  delete(@Param('id') id: string) {
    return this.stockAssetService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async restoreByIds(@Body() ids: string[]): Promise<StockAsset[]> {
    return this.stockAssetService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'stockassets')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateStockAssetDto): Promise<StockAsset> {
    return await this.stockAssetService.update(id, updateDto);
  }
}
