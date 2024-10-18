import {ExampleService} from './example.service';
import {CreateExampleDto} from './dto/create-example.dto';
import {UpdateExampleDto} from './dto/update-example.dto';
import {Example} from './entities/example.entity';
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

@Controller('example')
@ApiTags('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'examples')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@Body() createDto: CreateExampleDto, @Req() request: Request): Promise<Example> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(new Types.ObjectId(user?.libraryId)) ?? null;
    return await this.exampleService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'examples')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'example'))
  async findAll(@Query() query: Partial<CreateExampleDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Example>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.exampleService.findAll(pageOptionDto, query);
  }
  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreateExampleDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Example>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.exampleService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Example>> {
    return await this.exampleService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemDto<Example>> {
    return await this.exampleService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.exampleService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Example>> {
    return await this.exampleService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.exampleService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.exampleService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Example[]> {
    return this.exampleService.restoreByIds(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateExampleDto): Promise<Example> {
    return await this.exampleService.update(id, updateDto);
  }
}
