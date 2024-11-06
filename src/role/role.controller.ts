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
  @Roles(Role.SuperAdmin, Role.Admin, Role.Owner) // tên role để chặn bên dưới
  @UseGuards(RolesGuard)
  async findAll(@Query() query: Partial<CreateRoleDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<RoleS>> {
    let result = await this.roleService.findAll(pageOptionDto, query);
    const user = request['user'];
    if (user.isAdmin) {
      result = await this.roleService.findAll(pageOptionDto, query, true);
    }
    return result;
  }

  @Get('super-admin')
  @Roles(Role.SuperAdmin) // tên role để chặn bên dưới
  @UseGuards(RolesGuard)
  async findAll2(@Query() query: Partial<CreateRoleDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<RoleS>> {
    const user = request['user'];
    if (user.isAdmin) {
      return await this.roleService.findAll(pageOptionDto, query, true);
    }
  }

  @Post('add-permission')
  @Roles(Role.SuperAdmin) // tên role để chặn bên dưới
  @UseGuards(RolesGuard)
  async addPermisson(@Body() permissionDto: PermissonRoleDto): Promise<RoleS> {
    return await this.roleService.addPermisson(permissionDto);
  }

  @Delete('remove-permission')
  @Roles(Role.SuperAdmin) // tên role để chặn bên dưới
  @UseGuards(RolesGuard)
  async removePermisson(@Body() permissionDto: PermissonRoleDto): Promise<RoleS> {
    return await this.roleService.removePermisson(permissionDto);
  }
}
