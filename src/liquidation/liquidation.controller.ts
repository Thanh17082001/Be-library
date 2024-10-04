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
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'liquidations')) // tên permission và bảng cần chặn
@UseGuards(CaslGuard)
export class LiquidationController {
  constructor(private readonly liquidationService: LiquidationService) {}

  @Post()
  async create(@Body() createDto: CreateLiquidationDto, @Req() request: Request): Promise<Liquidation> {
    const user = request['user'] ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.groupId = user?.groupId ?? null;
    return await this.liquidationService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'Liquidation')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Liquidation'))
  async findAll(@Query() query: Partial<CreateLiquidationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Liquidation>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.liquidationService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateLiquidationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Liquidation>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.liquidationService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Liquidation>> {
    return await this.liquidationService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<Liquidation>> {
    return await this.liquidationService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.liquidationService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Liquidation>> {
    return await this.liquidationService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.liquidationService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.liquidationService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Liquidation[]> {
    return this.liquidationService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateLiquidationDto): Promise<Liquidation> {
    return await this.liquidationService.update(id, updateDto);
  }
}
