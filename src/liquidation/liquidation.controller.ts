import {LiquidationService} from './liquidation.service';
import {CreateLiquidationDto} from './dto/create-liquidation.dto';
import {UpdateLiquidationDto} from './dto/update-liquidation.dto';
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
import {Liquidation} from './entities/liquidation.entity';

@Controller('liquidation')
@ApiTags('liquidation')
export class LiquidationController {
  constructor(private readonly liquidationService: LiquidationService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@Body() createDto: CreateLiquidationDto, @Req() request: Request): Promise<Liquidation> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    return await this.liquidationService.create({...createDto});
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAll(@Query() query: Partial<CreateLiquidationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Liquidation>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.liquidationService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreateLiquidationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Liquidation>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.liquidationService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Liquidation>> {
    return await this.liquidationService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOne(@Param('id') id: string): Promise<ItemDto<Liquidation>> {
    return await this.liquidationService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  deleteSelected(@Body() ids: string[]) {
    return this.liquidationService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<Liquidation>> {
    return await this.liquidationService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.liquidationService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.liquidationService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body() ids: string[]): Promise<Liquidation[]> {
    return this.liquidationService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@Param('id') id: string, @Body() updateDto: UpdateLiquidationDto): Promise<Liquidation> {
    return await this.liquidationService.update(id, updateDto);
  }
}
