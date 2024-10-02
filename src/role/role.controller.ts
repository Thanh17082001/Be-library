import {RoleService} from './role.service';
import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req} from '@nestjs/common';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {ApiTags} from '@nestjs/swagger';
import {ObjectId, Types} from 'mongoose';
import {Roles} from 'src/role/role.decorator';
import {RolesGuard} from 'src/role/role.guard';
import {CaslGuard} from 'src/casl/casl.guard';
import {CheckPolicies} from 'src/casl/check-policies.decorator';
import {AppAbility} from 'src/casl/casl-ability.factory/casl-ability.factory';
import {Action} from 'src/casl/casl.action';
import {Request} from 'express';
import {Public} from 'src/auth/auth.decorator';
import {CreateRoleDto} from './dto/create-role.dto';
import {RoleS} from './entities/role.entity';
import {PermissonDto} from 'src/user/dto/permission.dto';
import {User} from 'src/user/entities/user.entity';
import {PermissonRoleDto} from './dto/permission-role.dto';
import {Role} from './role.enum';
import {permission} from 'process';

@Controller('role')
@ApiTags('role')
@Public()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // @Post()
  // async create() {
  //   // console.log(...Object.keys(Role));
  //   const roles = Object.keys(Role)
  //   for (let i = 0; i < roles.length; i++){
  //     const createDto:CreateRoleDto = {
  //       name: roles[i],
  //       permissions:[]
  //     }

  //    await this.roleService.create({ ...createDto });
  //   }
  // }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permission và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'example'))
  async findAll(@Query() query: Partial<CreateRoleDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<RoleS>> {
    return await this.roleService.findAll(pageOptionDto, query);
  }

  @Public()
  @Post('add-permission')
  async addPermisson(@Body() permissionDto: PermissonRoleDto): Promise<RoleS> {
    return await this.roleService.addPermisson(permissionDto);
  }

  @Public()
  @Delete('remove-permission')
  async removePermisson(@Body() permissionDto: PermissonRoleDto): Promise<RoleS> {
    return await this.roleService.removePermisson(permissionDto);
  }
}
