import {PublicationService} from './publication.service';
import {CreatePublicationDto} from './dto/create-publication.dto';
import {UpdatePublicationDto} from './dto/update-publication.dto';
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
import {Publication} from './entities/publication.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {multerOptions, storage} from 'src/config/multer.config';

@Controller('publications')
@ApiTags('publications')
// @Public()
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('publication'), ...multerOptions}))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async create(@UploadedFile() file: Express.Multer.File, @Body() createDto: CreatePublicationDto, @Req() request: Request): Promise<any> {
    const user = request['user'] ?? null;
    let images = [];
    createDto.path = '';
    if (file) {
      if (file.mimetype == 'application/pdf') {
        images = await this.publicationService.convertPdfToImages(file?.path);
      }
      createDto.path = `/publication/${file.filename}`;
    }
    createDto.images = images;
    createDto.priviewImage = images ? images[0] : null;

    createDto.createBy = user?._id ?? null;
    createDto.libraryId = user?.libraryId ?? null;
    createDto.groupId = user?.groupId ?? null;

    createDto.quantity = +createDto.quantity;
    createDto.shelvesQuantity = +createDto.shelvesQuantity;

    createDto.authorIds = createDto.authorIds ? JSON.parse(createDto.authorIds?.toString()) : [];
    createDto.categoryIds = createDto.categoryIds ? JSON.parse(createDto.categoryIds?.toString()) : [];
    createDto.publisherIds = createDto.publisherIds ? JSON.parse(createDto.publisherIds?.toString()) : [];
    createDto.materialIds = createDto.materialIds ? JSON.parse(createDto.materialIds?.toString()) : [];

    return await this.publicationService.create({...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permission và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permission (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Publication'))
  async findAll(@Query() query: Partial<CreatePublicationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publication>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.publicationService.findAll(pageOptionDto, query);
  }

  @Get('/deleted')
  async findAllDeleted(@Query() query: Partial<CreatePublicationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publication>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.publicationService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Publication>> {
    return await this.publicationService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: Types.ObjectId): Promise<ItemDto<Publication>> {
    return await this.publicationService.findOne(id);
  }

  @Delete('selected')
  deleteSelected(@Body() ids: string[]) {
    return this.publicationService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  async removes(@Body() ids: string[]): Promise<Array<Publication>> {
    return await this.publicationService.removes(ids);
  }

  @Delete('soft/:id')
  remove(@Param('id') id: string) {
    return this.publicationService.remove(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.publicationService.delete(id);
  }

  @Patch('restore')
  async restoreByIds(@Body() ids: string[]): Promise<Publication[]> {
    return this.publicationService.restoreByIds(ids);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('publication'), ...multerOptions}))
  async update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateDto: UpdatePublicationDto): Promise<Publication> {
    updateDto.authorIds = updateDto.authorIds ? JSON.parse(updateDto.authorIds?.toString()) : [];
    updateDto.categoryIds = updateDto.categoryIds ? JSON.parse(updateDto.categoryIds?.toString()) : [];
    updateDto.publisherIds = updateDto.publisherIds ? JSON.parse(updateDto.publisherIds?.toString()) : [];
    updateDto.materialIds = updateDto.materialIds ? JSON.parse(updateDto.materialIds?.toString()) : [];
    let images = [];
    updateDto.path = '';
    if (file) {
      if (file.mimetype == 'application/pdf') {
        images = await this.publicationService.convertPdfToImages(file?.path);
      }
      updateDto.path = `/publication/${file.filename}`;
    }
    updateDto.images = images;
    updateDto.priviewImage = images ? images[0] : null;
    return await this.publicationService.update(id, updateDto);
  }
}
