import {VoiceService} from './voice.service';
import {CreateVoiceDto} from './dto/create-voice.dto';
import {UpdateVoiceDto} from './dto/update-voice.dto';
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
import {Voice} from './entities/voice.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {multerOptions, storage} from 'src/config/multer.config';

@Controller('voice')
@ApiTags('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('voice'), ...multerOptions}))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async create(@UploadedFile() file: Express.Multer.File, @Body() createDto: CreateVoiceDto, @Req() request: Request): Promise<Voice> {
    const user = request['user'] ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    if (!file) {
      throw new BadRequestException('File is required');
    }
    createDto.name = file.originalname;
    createDto.path = `voice/${file.filename}`;
    createDto.createBy = new Types.ObjectId(user?._id) ?? null;
    return await this.voiceService.create({...createDto});
  }

  @Get()
  // @Roles(Role.Student) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Voice'))
  async findAll(@Query() query: Partial<CreateVoiceDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Voice>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.voiceService.findAll(pageOptionDto, query);
  }
  @Get('link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async lt(@Query() query: Partial<CreateVoiceDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Voice>> {
    const user = request['user'];
    const libraryId = user?.libraryId ?? null;

    return await this.voiceService.GetIsLink(libraryId, pageOptionDto);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAllDeleted(@Query() query: Partial<CreateVoiceDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Voice>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.voiceService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Voice>> {
    return await this.voiceService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOne(@Param('id') id: string): Promise<ItemDto<Voice>> {
    return await this.voiceService.findOne(new Types.ObjectId(id));
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  deleteSelected(@Body() ids: string[]) {
    return this.voiceService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async removes(@Body() ids: string[]): Promise<Array<Voice>> {
    return await this.voiceService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  remove(@Param('id') id: string) {
    return this.voiceService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  delete(@Param('id') id: string) {
    return this.voiceService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async restoreByIds(@Body() ids: string[]): Promise<Voice[]> {
    return this.voiceService.restoreByIds(ids);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('voice'), ...multerOptions}))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'voices')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateDto: UpdateVoiceDto): Promise<Voice> {
    if (!file) {
      updateDto.path = '';
    } else {
      updateDto.path = `voice/${file.filename}`;
    }
    return await this.voiceService.update(id, updateDto);
  }
}
