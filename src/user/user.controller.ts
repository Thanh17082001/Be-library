import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException} from '@nestjs/common';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {ApiConsumes, ApiTags} from '@nestjs/swagger';
import {ObjectId, Types} from 'mongoose';
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
import {ChangeUsernameDto} from './dto/change-username.dto';
import {RoleService} from 'src/role/role.service';
import {RoleS} from 'src/role/entities/role.entity';
import {Roles} from 'src/role/role.decorator';
import {RabbitmqService} from 'src/rabbitmq/rabbitmq.service';
import {EmailDto} from 'src/mail/dto/create-mail.dto';
import {CodeForgotService} from 'src/code-forgot/code-forgot.service';
import {generateVerificationCode} from 'src/common/random-code-forgot-pass';
import {CodeForgot} from 'src/code-forgot/entities/code-forgot.entity';
import {checkExpired} from 'src/common/check-expired';
import {ConfirmPass, ForgotPassDto} from './dto/forgot-pass.dto';
import * as crypto from 'crypto';
import {ResetPassDto} from './dto/reset-forgot-pass.dto';
import {validateEmail} from 'src/common/validate-email';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly rabbitMQService: RabbitmqService,
    private readonly codeForgotService: CodeForgotService
  ) {}

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
    // console.log(data);
    let users: Array<User> = [];
    let errors: Array<{row: number; error: string}> = [];
    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        // console.log(item);
        const valuesItem = Object.values(item);
        // console.log(valuesItem);
        let roleName = '';
        if (data[i]['vai trò'] == 'giáo viên' || data[i]['vai trò'] == 'Giáo viên' || data[i]['vai trò'] == 'Giáo Viên') {
          roleName = Role.Teacher;
        } else if (data[i]['vai trò'] == 'học sinh' || data[i]['vai trò'] == 'Học sinh' || data[i]['vai trò'] == 'Học Sinh') {
          roleName = Role.Student;
        }
        const role: any = await this.roleService.findByName(roleName || Role.Student);
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
          roleId: role._id.toString(),
          createBy: new Types.ObjectId(user?._id) ?? null,
          note: '',
          barcode: '',
          class: data[i]['lớp'] ?? '',
          school: user.school,
        };
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

  @Public()
  @Patch('code-forgot-password')
  async sendEmail(@Body() forgotPassDto: ForgotPassDto) {
    const user: User = await this.userService.findOne({username: forgotPassDto.username});
    if (!validateEmail(user.email)) {
      throw new BadRequestException('Tài khoản này chưa có email hoặc email không hợp lệ vui lòng liên hệ thủ thư để đặt lại mật khẩu');
    }
    let emailDto: EmailDto = {
      emails: [],
      subject: '',
      body: '',
    };
    const code = generateVerificationCode();
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    const codeOld: CodeForgot = await this.codeForgotService.findOneByEmail(user.email);
    if (codeOld) {
      await this.codeForgotService.remove(user.email, codeOld.code);
    }

    await this.codeForgotService.create({code, mail: user.email});

    const htmlContent = `
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #000;">
        <div style=" margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <header style="background-color: #4CAF50; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ĐẶT LẠI MẬT KHẨU</h1>
          </header>
          <div style="padding: 20px; color: #000;">
            <p>Kính gửi <strong style="color: blue;">${user.fullname}</strong>,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color: blue;">${user.username}</strong> của bạn. Để tiếp tục, 
            Sử dụng mã bảo mật của bạn để đặt lại mật khẩu, mã này có thời hạn 60 giây:</p>
            <p>
              <span style="display: inline-block; color: red; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 20px; letter-spacing: 3px;">${code}</a>
            </p>
            <p style=" color: red; font-style:italic;">Bạn vui lòng không chia sẻ mã này cho bất kỳ ai để tránh rủi ro bảo mật.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn sẽ vẫn an toàn.</p>
            <p>Trân trọng,</p>
          </div>
          <footer style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 12px; color: #666;">
            <p>© 2025 Công ty cổ phần giải pháp công nghệ GDVN. All rights reserved.</p>
          </footer>
        </div>
      </body>
      `;
    emailDto.body = htmlContent;
    emailDto.emails = [user.email];
    emailDto.subject = 'QUÊN MẬT KHẨU';

    const result = await this.rabbitMQService.sendEmailToQueue(emailDto);
    return new ItemDto(result);
  }

  @Public()
  @Patch('confirm-forgot-password')
  async confirmForgotPassword(@Body() confirmPass: ConfirmPass) {
    const user: User = await this.userService.findOne({username: confirmPass.username});

    const code: CodeForgot = await this.codeForgotService.findOne(user.email, confirmPass.code);
    if (checkExpired(code?.codeExpiry)) {
      throw new BadRequestException('Mã xác nhận hết hạn hoặc không hợp lệ');
    }

    const token = crypto.randomBytes(12).toString('hex');

    await this.codeForgotService.update(user.email, token);

    return new ItemDto({token: token});
  }
  @Public()
  @Patch('reset-password')
  async resetPassword(@Body() resetPassDto: ResetPassDto) {
    const user: User = await this.userService.findOne({username: resetPassDto.username});

    const code: CodeForgot = await this.codeForgotService.checkConfirm(user.email, resetPassDto.token);
    if (!code) {
      throw new BadRequestException('Không có quyền hoặc chưa xác nhận mã');
    }

    const result = await this.userService.resetPassword(user._id, resetPassDto.password);
    await this.codeForgotService.remove(user.email, code.code);
    return new ItemDto(result);
  }

  @Patch('change-username')
  async changeUsername(@Body() changeUserNameDto: ChangeUsernameDto): Promise<User> {
    return await this.userService.changeUsername(changeUserNameDto);
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
