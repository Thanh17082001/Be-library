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
import {Publication} from './entities/publication.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {multerOptions, storage} from 'src/config/multer.config';

import * as XLSX from 'xlsx';
import {ImportExcel} from './dto/import-excel.dto';
import {AuthorService} from 'src/author/author.service';
import {CategoryService} from 'src/category/category.service';
import {PublisherService} from 'src/publisher/publisher.service';
import {MaterialService} from 'src/material/material.service';
import {UpdateQuantityShelves, UpdateQuantityStock} from './dto/update-shelvesdto';
import {generateImageFromVideo} from 'src/common/genegrate-image-from-video';
import {Library} from 'src/library/entities/library.entity';
import {SearchName} from './dto/search-name.dto';
import {LibraryService} from 'src/library/library.service';

@Controller('publications')
@ApiTags('publications')
// @Public()
export class PublicationController {
  constructor(
    private readonly publicationService: PublicationService,
    private readonly authorService: AuthorService,
    private readonly categoryService: CategoryService,
    private readonly publisherService: PublisherService,
    private readonly materialService: MaterialService,
    private readonly libraryService: LibraryService
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
    let fileSize = file?.size / (1024 * 1024) || 0;
    if (file) {
      createDto.mimetype = file.mimetype;
      if (file.mimetype == 'application/pdf') {
        const convertPdftoimage = await this.publicationService.convertPdfToImages(file?.path);
        images = convertPdftoimage.files;
        fileSize += convertPdftoimage.totalSizeMB;
        createDto.path = `publication/pdf/${file.filename}`;
        createDto.priviewImage = images.length > 0 ? images[0] : createDto.path;
      } else if (file.mimetype == 'video/mp4') {
        const generateImage = await generateImageFromVideo(`publication/video/${file.filename}`);
        createDto.priviewImage = generateImage.path;
        fileSize += generateImage.sizeMB;
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

    createDto.createBy = new Types.ObjectId(user?._id.toString()) ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId?.toString()) ?? null;

    createDto.quantity = +createDto.quantity;
    createDto.shelvesQuantity = +createDto.shelvesQuantity;

    createDto.authorIds = createDto.authorIds ? JSON.parse(createDto.authorIds?.toString()) : [];
    createDto.categoryIds = createDto.categoryIds ? JSON.parse(createDto.categoryIds?.toString()) : [];
    createDto.publisherIds = createDto.publisherIds ? JSON.parse(createDto.publisherIds?.toString()) : [];
    createDto.materialIds = createDto.materialIds ? JSON.parse(createDto.materialIds?.toString()) : [];
    if (file) {
      const library = await this.libraryService.findById(user.libraryId);
      if (library.totalStorageUsed + fileSize > library.maxStorageLimit) {
        throw new BadRequestException(`Đã vượt quá số dung lượng: ${library.maxStorageLimit / 1024} GB`);
      }
      await this.libraryService.updateStorageLimit(user.libraryId, +fileSize);
    }
    const result = await this.publicationService.create({...createDto});

    return result;
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
    for (let i = 0; i < data.length; i++) {
      try {
        let categoryIds = [];
        let authorIds = [];
        let publisherIds = [];
        let materialIds = [];

        const item = data[i];
        const publication = Object.values(item);
        categoryIds = await this.categoryService.findByName(
          publication[5].split(',').map(item => item.toLowerCase().trim()),
          user.libraryId
        );
        authorIds = await this.authorService.findByName(
          publication[6].split(',').map(item => item.toLowerCase().trim()),
          user.libraryId
        );
        publisherIds = await this.publisherService.findByName(
          publication[7].split(',').map(item => item.toLowerCase().trim()),
          user.libraryId
        );
        materialIds = await this.materialService.findByName(
          publication[8].split(',').map(item => item.toLowerCase().trim()),
          user.libraryId
        );
        const createDto: CreatePublicationDto = {
          name: publication[1],
          barcode: publication[2],
          quantity: 0,
          shelvesQuantity: 0,
          path: '',
          priviewImage: '',
          images: [],
          description: publication[3],
          libraryId: new Types.ObjectId(user?.libraryId?.toString()) ?? null,
          status: 'không có sẵn',
          shelvesId: null,
          publisherIds,
          categoryIds,
          authorIds,
          materialIds,
          isLink: false,
          isPublic: true,
          type: publication[4],
          createBy: new Types.ObjectId(user?._id.toString()) ?? null,
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAll(@Query() query: Partial<CreatePublicationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publication>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    if (query.libraryId) {
      query.libraryId = new Types.ObjectId(query.libraryId);
    }
    return await this.publicationService.findAll(pageOptionDto, query);
  }

  @Get('link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async lt(@Query() query: Partial<CreatePublicationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publication>> {
    const user = request['user'];
    const libraryId = user?.libraryId ?? null;

    return await this.publicationService.GetIsLink(libraryId, pageOptionDto, query);
  }
  @Get('/name')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findByname(@Query() query: SearchName, @Req() request: Request): Promise<ItemDto<Publication>> {
    const user = request['user'];
    query.libraryId = query.libraryId ?? user.libraryId;
    return await this.publicationService.findBynames(query);
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findAllDeleted(@Query() query: Partial<CreatePublicationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publication>> {
    const user = request['user'];
    query.libraryId = new Types.ObjectId(user?.libraryId?.toString()) ?? null;
    return await this.publicationService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Publication>> {
    return await this.publicationService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findOne(@Param('id') id: Types.ObjectId): Promise<ItemDto<Publication>> {
    return await this.publicationService.findOne(id);
  }

  @Get('barcode/:barcode')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async findByBarcode(@Param('barcode') barcode: string, @Req() request: Request): Promise<ItemDto<Publication>> {
    const user = request['user'];
    const libraryId = user.libraryId;
    return await this.publicationService.findByBarcode(barcode, libraryId);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  deleteSelected(@Body() ids: string[]) {
    return this.publicationService.deleteMultiple(ids);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async removes(@Body() ids: string[]): Promise<Array<Publication>> {
    return await this.publicationService.removes(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  remove(@Param('id') id: string) {
    return this.publicationService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  delete(@Param('id') id: string) {
    return this.publicationService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async restoreByIds(@Body() ids: string[]): Promise<Publication[]> {
    return this.publicationService.restoreByIds(ids);
  }

  @Patch('shelves-quantity')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async updateQuantityShelves(@Body() data: UpdateQuantityShelves): Promise<Publication> {
    return this.publicationService.updateQuantityShelves(data);
  }

  @Patch('move-stock')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async updateQuantityStock(@Body() data: UpdateQuantityStock): Promise<Publication> {
    return this.publicationService.updateQuantityStock(data);
  }

  @Patch('link/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async link(@Param('id') id: string): Promise<Publication> {
    return await this.publicationService.link(id);
  }

  @Patch('unlink/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async unlink(@Param('id') id: string): Promise<Publication> {
    return await this.publicationService.unlink(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('publication', true), ...multerOptions}))
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'publications')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateDto: UpdatePublicationDto, @Req() request: Request): Promise<Publication> {
    const user = request['user'] ?? null;
    updateDto.authorIds = updateDto.authorIds ? JSON.parse(updateDto.authorIds?.toString()) : [];
    updateDto.categoryIds = updateDto.categoryIds ? JSON.parse(updateDto.categoryIds?.toString()) : [];
    updateDto.publisherIds = updateDto.publisherIds ? JSON.parse(updateDto.publisherIds?.toString()) : [];
    updateDto.materialIds = updateDto.materialIds ? JSON.parse(updateDto.materialIds?.toString()) : [];
    updateDto.path = '';
    updateDto.priviewImage = '';
    let fileSize = file?.size / (1024 * 1024) || 0;
    if (file) {
      if (file.mimetype == 'application/pdf') {
        const convertPdftoimage = await this.publicationService.convertPdfToImages(file?.path);
        fileSize += convertPdftoimage.totalSizeMB;
        updateDto.images = convertPdftoimage.files;
        updateDto.path = `publication/pdf/${file.filename}`;
        updateDto.priviewImage = updateDto.images.length > 0 ? updateDto.images[0] : updateDto.path;
      } else if (file.mimetype == 'video/mp4') {
        const generateImage = await generateImageFromVideo(`publication/video/${file.filename}`);
        updateDto.priviewImage = generateImage.path;
        fileSize += generateImage.sizeMB;
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
    if (file) {
      const library = await this.libraryService.findById(user.libraryId);
      if (library.totalStorageUsed + fileSize > library.maxStorageLimit) {
        throw new BadRequestException(`Đã vượt quá số dung lượng: ${library.maxStorageLimit / 1024} GB`);
      }
      await this.libraryService.updateStorageLimit(user.libraryId, +fileSize);
    }
    const result = await this.publicationService.update(id, updateDto);

    return result;
  }
}
