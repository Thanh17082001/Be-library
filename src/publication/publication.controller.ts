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

import * as XLSX from 'xlsx';
import {ImportExcel} from './dto/import-excel.dto';
import {AuthorService} from 'src/author/author.service';
import {Category} from 'src/category/entities/category.entity';
import {CategoryService} from 'src/category/category.service';
import {PublisherService} from 'src/publisher/publisher.service';
import {MaterialService} from 'src/material/material.service';
import {UpdateQuantityShelves, UpdateQuantityStock} from './dto/update-shelvesdto';
import {log} from 'console';
import {generateImageFromVideo} from 'src/common/genegrate-image-from-video';

@Controller('publications')
@ApiTags('publications')
// @Public()
export class PublicationController {
  constructor(
    private readonly publicationService: PublicationService,
    private readonly authorService: AuthorService,
    private readonly categoryService: CategoryService,
    private readonly publisherService: PublisherService,
    private readonly materialService: MaterialService
  ) {}
  @Get('test')
  async abc() {
    await this.publicationService.test();
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('publication', true), ...multerOptions}))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async create(@UploadedFile() file: Express.Multer.File, @Body() createDto: CreatePublicationDto, @Req() request: Request): Promise<any> {
    const user = request['user'] ?? null;
    let images = [];
    createDto.path = '';
    if (file) {
      createDto.mimetype = file.mimetype;
      if (file.mimetype == 'application/pdf') {
        images = await this.publicationService.convertPdfToImages(file?.path);
        createDto.path = `publication/pdf/${file.filename}`;
        createDto.priviewImage = images.length > 0 ? images[0] : createDto.path;
      } else if (file.mimetype == 'video/mp4') {
        createDto.priviewImage = await generateImageFromVideo(`publication/video/${file.filename}`);
        createDto.path = `publication/video/${file.filename}`;
      } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        createDto.path = `publication/ptt/${file.filename}`;
        createDto.priviewImage = '/default/default-ptt.jpg';
      } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        createDto.path = `publication/word/${file.filename}`;
        createDto.priviewImage = '/default/default-word.jpg';
      } else {
        createDto.path = `publication/image/${file.filename}`;
        createDto.priviewImage = `publication/image/${file.filename}`;
      }
    }
    createDto.images = images;

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

  @Post('import-excel')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async importExcel(@UploadedFile() file: Express.Multer.File, @Req() request: Request, @Body() body: ImportExcel): Promise<any> {
    const user = request['user'] ?? null;
    const workbook = XLSX.read(file.buffer, {type: 'buffer'});
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    let publications: Array<Publication> = [];
    let errors: Array<{row: number; error: string}> = [];
    console.log(data.length);
    for (let i = 0; i < data.length; i++) {
      try {
        let categoryIds = [];
        let authorIds = [];
        let publisherIds = [];
        let materialIds = [];

        const item = data[i];
        const publication = Object.values(item);
        categoryIds = await this.categoryService.findByName(publication[5].split(',').map(item => item.toLowerCase().trim()));
        authorIds = await this.authorService.findByName(publication[6].split(',').map(item => item.toLowerCase().trim()));
        publisherIds = await this.publisherService.findByName(publication[7].split(',').map(item => item.toLowerCase().trim()));
        materialIds = await this.materialService.findByName(publication[8].split(',').map(item => item.toLowerCase().trim()));
        const createDto: CreatePublicationDto = {
          name: publication[1],
          barcode: publication[2],
          quantity: 0,
          shelvesQuantity: 0,
          path: '',
          priviewImage: '',
          images: [],
          description: publication[3],
          libraryId: user?.libraryId ?? null,
          groupId: user?.groupId ?? null,
          status: 'không có sẵn',
          shelvesId: null,
          publisherIds,
          categoryIds,
          authorIds,
          materialIds,
          isLink: false,
          isPublic: true,
          type: publication[4],
          createBy: user?._id ?? null,
          note: '',
          totalQuantity: 0,
          mimetype: null,
        };
        const ressult = await this.publicationService.create({...createDto});
        publications.push(ressult);
      } catch (error) {
        errors.push({row: i + 1, error: error.message});
      }
    }
    return {publications, errors};
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

  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string): Promise<ItemDto<Publication>> {
    return await this.publicationService.findByBarcode(barcode);
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

  @Patch('shelves-quantity')
  async updateQuantityShelves(@Body() data: UpdateQuantityShelves): Promise<Publication> {
    return this.publicationService.updateQuantityShelves(data);
  }

  @Patch('move-stock')
  async updateQuantityStock(@Body() data: UpdateQuantityStock): Promise<Publication> {
    return this.publicationService.updateQuantityStock(data);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('publication', true), ...multerOptions}))
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
        updateDto.path = `publication/pdf/${file.filename}`;
        updateDto.priviewImage = images.length > 0 ? images[0] : updateDto.path;
      } else if (file.mimetype == 'video/mp4') {
        updateDto.priviewImage = await generateImageFromVideo(`publication/video/${file.filename}`);
        updateDto.path = `publication/video/${file.filename}`;
      } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        updateDto.path = `publication/ptt/${file.filename}`;
        updateDto.priviewImage = '/default/default-ptt.jpg';
      } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        updateDto.path = `publication/word/${file.filename}`;
        updateDto.priviewImage = '/default/default-word.jpg';
      } else {
        updateDto.path = `publication/image/${file.filename}`;
        updateDto.priviewImage = `publication/image/${file.filename}`;
      }
    }

    updateDto.quantity = +updateDto.quantity;
    updateDto.shelvesQuantity = +updateDto.shelvesQuantity;
    return await this.publicationService.update(id, updateDto);
  }
}
