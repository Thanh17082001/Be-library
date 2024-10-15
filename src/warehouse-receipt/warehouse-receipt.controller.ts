import {WarehouseReceiptService} from './warehouse-receipt.service';
import {CreateWarehouseReceiptDto} from './dto/create-warehouse-receipt.dto';
import {UpdateWarehouseReceiptDto} from './dto/update-warehouse-receipt.dto';

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
import {WarehouseReceipt} from './entities/warehouse-receipt.entity';

@Controller('warehouse-receipt')
@ApiTags('warehouse-receipt')
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'warehousereceipts')) // tên permission và bảng cần chặn
@UseGuards(CaslGuard)
export class WarehouseReceiptController {
  constructor(private readonly warehouseReceiptService: WarehouseReceiptService) {}

  @Post()
  async create(@Body() createDto: CreateWarehouseReceiptDto, @Req() request: Request): Promise<WarehouseReceipt> {
    const user = request['user'] ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.groupId = user?.groupId ?? null;
    return await this.warehouseReceiptService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'warehousereceipts')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'WarehouseReceipt'))
  async findAll(@Query() query: Partial<CreateWarehouseReceiptDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<WarehouseReceipt>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.warehouseReceiptService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateWarehouseReceiptDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<WarehouseReceipt>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.warehouseReceiptService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<WarehouseReceipt>> {
    return await this.warehouseReceiptService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<WarehouseReceipt>> {
    return await this.warehouseReceiptService.findOne(new Types.ObjectId(id));
  }

  @Get('accept/:id')
  async acceptWarehouse(@Param('id') id: string): Promise<WarehouseReceipt> {
    return await this.warehouseReceiptService.accept(id);
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.warehouseReceiptService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<WarehouseReceipt>> {
    return await this.warehouseReceiptService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.warehouseReceiptService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.warehouseReceiptService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<WarehouseReceipt[]> {
    return this.warehouseReceiptService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateWarehouseReceiptDto): Promise<WarehouseReceipt> {
    return await this.warehouseReceiptService.update(id, updateDto);
  }
}
