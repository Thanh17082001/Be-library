import {LiquidationService} from './liquidation.service';
import {CreateLiquidationDto} from './dto/create-liquidation.dto';
import {UpdateLiquidationDto} from './dto/update-liquidation.dto';
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
import {Liquidation} from './entities/liquidation.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {multerOptions, storage} from 'src/config/multer.config';
import {UploadFileSignature} from './dto/upload-file.dto';
import {typeImage} from 'src/utils/file-image-type';

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
    createDto.createBy = new Types.ObjectId(user?._id) ?? null;
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

  @Patch('signature/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async signature(@Param('id') id: string): Promise<Liquidation> {
    return await this.liquidationService.signature(id);
  }

  @Patch('upload/:id')
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('liquidation', true), ...multerOptions}))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async upload(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() uploadDto: UploadFileSignature, @Req() request: Request): Promise<any> {
    if (!file) {
      throw new BadRequestException('Bạn chưa chọn file');
    }
    if (file.mimetype == 'application/pdf') {
      uploadDto.fileSignature = {
        path: `liquidation/pdf/${file.filename}`,
        name: file.originalname,
        typeFile: 'pdf',
      };
    } else if (typeImage.includes(file.mimetype)) {
      {
        uploadDto.fileSignature = {
          path: `liquidation/image/${file.filename}`,
          name: file.originalname,
          typeFile: 'image',
        };
      }
    } else {
      throw new BadRequestException('File tải lên phải là dạng PDF hoặc Ảnh');
    }
    return await this.liquidationService.uploadFile(id, uploadDto);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'liquidations')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@Param('id') id: string, @Body() updateDto: UpdateLiquidationDto): Promise<Liquidation> {
    return await this.liquidationService.update(id, updateDto);
  }
}
