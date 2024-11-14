import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException} from '@nestjs/common';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {ApiConsumes, ApiTags} from '@nestjs/swagger';
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
import {FileInterceptor} from '@nestjs/platform-express';
import {multerOptions, storage} from 'src/config/multer.config';

import * as XLSX from 'xlsx';
import {ImportExcel} from './dto/import-excel.dto';
import {formatDate} from 'src/utils/format-date';
import {generateBarcode} from 'src/common/genegrate-barcode';
import {ChangePasswordDto} from './dto/change-pass.dto';
import {ChangeInfoUserDto} from './dto/change-info.dto';
import {LibraryService} from 'src/library/library.service';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('avatar'), ...multerOptions}))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createDto: CreateUserDto, @Req() request: Request): Promise<User> {
    const user = request['user'] ?? null;
    createDto.avatar = file ? `/avatar/${file.filename}` : '';
    createDto.createBy = new Types.ObjectId(user?._id) ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;

    return await this.userService.create({...createDto});
  }

  @Post('import-excel')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async importExcel(@UploadedFile() file: Express.Multer.File, @Req() request: Request, @Body() body: ImportExcel) {
    const user = request['user'] ?? null;
    const workbook = XLSX.read(file.buffer, {type: 'buffer'});
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    let users: Array<User> = [];
    let errors: Array<{row: number; error: string}> = [];
    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        const valuesItem = Object.values(item);
        const createDto: CreateUserDto = {
          fullname: valuesItem[1],
          email: valuesItem[2],
          phoneNumber: valuesItem[3],
          address: valuesItem[4],
          birthday: formatDate(valuesItem[5]),
          gender: valuesItem[6],
          username: '',
          password: '',
          libraryId: new Types.ObjectId(user?.libraryId) ?? null,
          passwordFirst: '',
          avatar: '',
          roleId: new Types.ObjectId(),
          createBy: user?._id ?? null,
          note: '',
          barcode: '',
          class: '',
          school: '',
        };
        // console.log(createDto);
        const ressult = await this.userService.create({...createDto});
        users.push(ressult);
      } catch (error) {
        errors.push({row: i + 1, error: error.message});
      }
    }
    return {users, errors};
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAll(@Query() query: Partial<CreateUserDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<User>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }

    return await this.userService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreateUserDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<User>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.userService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<User>> {
    return await this.userService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @Public() // chặn permission (CRUD)
  async findOne(@Param('id') id: string): Promise<ItemDto<User>> {
    return await this.userService.findById(new Types.ObjectId(id));
  }

  @Get('barcode/:barcode')
  @Roles(Role.Admin, Role.Teacher, Role.Owner, Role.Student) // tên role để chặn bên dưới
  @UseGuards(RolesGuard)
  async findByBarcode(@Param('barcode') barcode: string): Promise<ItemDto<User>> {
    return await this.userService.findByBarcode(barcode);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  deleteSelected(@Body() ids: string[]) {
    return this.userService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<User>> {
    return await this.userService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body('ids') ids: string[]): Promise<User[]> {
    return this.userService.restoreByIds(ids);
  }

  @Patch('block-account/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'activeaccounts')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async blockAccount(@Param('id') id: string): Promise<User> {
    return await this.userService.blockAccount(id);
  }

  @Patch('active-account/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'activeaccounts')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async activeAccount(@Param('id') id: string): Promise<User> {
    return await this.userService.activeAccount(id);
  }

  @Patch('change-password')
  async changePassword(@Body() changePassword: ChangePasswordDto): Promise<User> {
    return await this.userService.changePassword(changePassword);
  }

  @Patch('change-info/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('avatar'), ...multerOptions}))
  async changeInfo(@UploadedFile() file: Express.Multer.File, @Body() changeInfoDto: ChangeInfoUserDto, @Param('id') id: string): Promise<ItemDto<User>> {
    changeInfoDto.avatar = file ? `/avatar/${file.filename}` : '';
    return new ItemDto(await this.userService.changeInfo(id, changeInfoDto));
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('avatar'), ...multerOptions}))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'users')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateDto: UpdateUserDto): Promise<User> {
    if (file) {
      updateDto.avatar = `/avatar/${file.filename}`;
    }
    return await this.userService.update(id, updateDto);
  }
}
