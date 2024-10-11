import {LoanshipService} from './loanship.service';
import {CreateLoanshipDto} from './dto/create-loanship.dto';
import {UpdateLoanshipDto} from './dto/update-loanship.dto';

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
import {LoanSlip} from './entities/loanship.entity';
import {FilterDateDto} from './dto/fillter-date.dto';

@Controller('loan-slip')
@ApiTags('loanSlip')
@Public()
export class LoanshipController {
  constructor(private readonly loanSlipService: LoanshipService) {}

  @Post()
  async create(@Body() createDto: CreateLoanshipDto, @Req() request: Request): Promise<LoanSlip> {
    const user = request['user'] ?? null;
    createDto.libraryId = createDto.libraryId ? (user?.libraryId ?? null) : createDto.libraryId;
    createDto.groupId = user?.groupId ?? null;
    return await this.loanSlipService.create({...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permission và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'LoanSlip'))
  async findAll(@Query() query: Partial<CreateLoanshipDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LoanSlip>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.loanSlipService.findAll(pageOptionDto, query);
  }

  @Get('filter-date')
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permission và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'LoanSlip'))
  async filterByDate(@Query() query: Partial<FilterDateDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LoanSlip>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.loanSlipService.filterByDate(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateLoanshipDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LoanSlip>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.loanSlipService.findDeleted(pageOptionDto, query);
  }
  @Get('approval/:id')
  async loanApproval(@Param() id: string): Promise<LoanSlip> {
    return this.loanSlipService.agreeToLoan(id);
  }

  @Get('return/:id')
  async loanReturn(@Param() id: string): Promise<LoanSlip> {
    return this.loanSlipService.returnToLoan(id);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<LoanSlip>> {
    return await this.loanSlipService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<LoanSlip>> {
    return await this.loanSlipService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.loanSlipService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<LoanSlip>> {
    return await this.loanSlipService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.loanSlipService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.loanSlipService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<LoanSlip[]> {
    return this.loanSlipService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateLoanshipDto): Promise<LoanSlip> {
    return await this.loanSlipService.update(id, updateDto);
  }
}
