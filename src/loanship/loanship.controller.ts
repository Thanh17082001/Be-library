import {Library} from 'src/library/entities/library.entity';
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
import {ReturnDto} from './dto/return.dto';

@Controller('loan-slip')
@ApiTags('loanSlip')
// @Public()
export class LoanshipController {
  constructor(private readonly loanSlipService: LoanshipService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async create(@Body() createDto: CreateLoanshipDto, @Req() request: Request): Promise<LoanSlip> {
    const user = request['user'] ?? null;
    createDto.libraryId = !createDto.libraryId ? (new Types.ObjectId(user?.libraryId) ?? null) : new Types.ObjectId(createDto.libraryId);
    createDto.isLink = !createDto.isLink ? false : createDto.isLink;
    createDto.createBy = createDto.isLink ? (new Types.ObjectId(user?._id) ?? null) : (new Types.ObjectId(createDto.createBy) ?? null);
    createDto.userId = createDto.isLink ? user?._id : createDto.userId;
    return await this.loanSlipService.create({...createDto});
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAll(@Query() query: Partial<CreateLoanshipDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LoanSlip>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.loanSlipService.findAll(pageOptionDto, query);
  }

  @Get('link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async link(@Query() query: Partial<CreateLoanshipDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LoanSlip>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.createBy = new Types.ObjectId(user?._id) ?? null;
      query.isLink = true;
    }
    return await this.loanSlipService.findAll(pageOptionDto, query);
  }

  @Get('request-link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async requestLink(@Query() query: Partial<CreateLoanshipDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LoanSlip>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
      query.isLink = true;
    }
    return await this.loanSlipService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreateLoanshipDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<LoanSlip>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.loanSlipService.findDeleted(pageOptionDto, query);
  }

  @Get('approval/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async loanApproval(@Param() id: string): Promise<LoanSlip> {
    return this.loanSlipService.agreeToLoan(id);
  }

  @Patch('return/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async loanReturn(@Param('id') id: string, @Body() ReturnDto: ReturnDto): Promise<LoanSlip> {
    return this.loanSlipService.returnToLoan(id, ReturnDto);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<LoanSlip>> {
    return await this.loanSlipService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOne(@Param('id') id: string): Promise<ItemDto<LoanSlip>> {
    return await this.loanSlipService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  deleteSelected(@Body() ids: string[]) {
    return this.loanSlipService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<LoanSlip>> {
    return await this.loanSlipService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.loanSlipService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.loanSlipService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body() ids: string[]): Promise<LoanSlip[]> {
    return this.loanSlipService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'loanslips')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@Param('id') id: string, @Body() updateDto: UpdateLoanshipDto): Promise<LoanSlip> {
    updateDto.libraryId = updateDto.libraryId ? (new Types.ObjectId(updateDto.libraryId) ?? null) : undefined;
    return await this.loanSlipService.update(id, updateDto);
  }
}
