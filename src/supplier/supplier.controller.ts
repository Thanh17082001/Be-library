import {SupplierService} from './supplier.service';
import {CreateSupplierDto} from './dto/create-supplier.dto';
import {UpdateSupplierDto} from './dto/update-supplier.dto';
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
import {Supplier} from './entities/supplier.entity';

@Controller('supplier')
@ApiTags('supplier')
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'supplier')) // tên permission và bảng cần chặn
@UseGuards(CaslGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async create(@Body() createDto: CreateSupplierDto, @Req() request: Request): Promise<Supplier> {
    const user = request['user'] ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.groupId = user?.groupId ?? null;
    return await this.supplierService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'Supplier')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Supplier'))
  async findAll(@Query() query: Partial<CreateSupplierDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Supplier>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.supplierService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateSupplierDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Supplier>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.supplierService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Supplier>> {
    return await this.supplierService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<Supplier>> {
    return await this.supplierService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.supplierService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Supplier>> {
    return await this.supplierService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.supplierService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Supplier[]> {
    return this.supplierService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateSupplierDto): Promise<Supplier> {
    return await this.supplierService.update(id, updateDto);
  }
}
