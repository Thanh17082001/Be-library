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
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@Body() createDto: CreateSupplierDto, @Req() request: Request): Promise<Supplier> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    createDto.createBy = new Types.ObjectId(user?.userId) ?? null;
    return await this.supplierService.create({...createDto});
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAll(@Query() query: Partial<CreateSupplierDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Supplier>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }

    return await this.supplierService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreateSupplierDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Supplier>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.supplierService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Supplier>> {
    return await this.supplierService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOne(@Param('id') id: string): Promise<ItemDto<Supplier>> {
    return await this.supplierService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  deleteSelected(@Body() ids: string[]) {
    return this.supplierService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<Supplier>> {
    return await this.supplierService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.supplierService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body() ids: string[]): Promise<Supplier[]> {
    return this.supplierService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'suppliers')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@Param('id') id: string, @Body() updateDto: UpdateSupplierDto): Promise<Supplier> {
    return await this.supplierService.update(id, updateDto);
  }
}
