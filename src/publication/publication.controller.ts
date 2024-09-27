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

@Controller('publication')
@ApiTags('publication')
@Public()
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {storage: storage('image'), ...multerOptions}))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createDto: CreatePublicationDto, @Req() request: Request): Promise<Publication> {
    const user = request['user'] ?? null;
    createDto.priviewImage = file ? `/image/${file.filename}` : '';

    createDto.createBy = user?._id ?? null;
    createDto.libraryId = user?.libraryId ?? null;

    createDto.path = `/image/${file.filename}`;

    return await this.publicationService.create({...createDto});
  }

  @Get()
  // @Roles(Role.User) // tên role để chặn bên dưới
  // @UseGuards(RolesGuard) // chặn role (admin, student ,....)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test')) // tên permisson và bảng cần chặn
  // @UseGuards(CaslGuard) // chặn permisson (CRUD)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'test'), (ability: AppAbility) => ability.can(Action.Read, 'Publication'))
  async findAll(@Query() query: Partial<CreatePublicationDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Publication>> {
    const user = request['user'];
    query.libraryId = user?.libraryId ?? null;
    return await this.publicationService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Publication>> {
    return await this.publicationService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePublicationDto): Promise<Publication> {
    return await this.publicationService.update(id, updateDto);
  }

  @Delete('selected')
  async removes(@Body() ids: string[]): Promise<Array<Publication>> {
    return await this.publicationService.removes(ids);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationService.remove(id);
  }
}
