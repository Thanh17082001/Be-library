import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
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
import {User} from './entities/user.entity';

@Controller('user')
@ApiTags('user')
@Public()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createDto: CreateUserDto, @Req() request: Request): Promise<User> {
    const user = request['user'] ?? null;
    return await this.userService.create({...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'User'))
  @Public()
  async findAll(@Query() query: Partial<CreateUserDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<User>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.userService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<User>> {
    return await this.userService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto): Promise<User> {
    return await this.userService.update(id, updateDto);
  }

  @Delete('selected')
  async removes(@Body() ids: string[]): Promise<Array<User>> {
    return await this.userService.removes(ids);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
