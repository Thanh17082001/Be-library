import {AuthorService} from './author.service';
import {CreateAuthorDto} from './dto/create-author.dto';
import {UpdateAuthorDto} from './dto/update-author.dto';
import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, BadRequestException} from '@nestjs/common';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {ApiTags} from '@nestjs/swagger';
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
import {Author} from './entities/author.entity';
import {PullLinkDto} from 'src/material/dto/pull-link.dto';

@Controller('author')
@ApiTags('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permisson (CRUD)
  async create(@Body() createDto: CreateAuthorDto, @Req() request: Request): Promise<Author> {
    const user = request['user'] ?? null;
    createDto.createBy = new Types.ObjectId(user?.userId) ?? null;
    createDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    return await this.authorService.create({...createDto});
  }

  @Post('pull-link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'materials')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard)
  async pullLink(@Body() pullLinkDto: PullLinkDto, @Req() request: Request) {
    const user = request['user'] ?? null;
    pullLinkDto.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    pullLinkDto.createBy = new Types.ObjectId(user?.id) ?? null;
    let errors: Array<{row: number; error: string; resource: any}> = [];
    let results: Author[] = [];
    if (pullLinkDto.ids.length == 0) {
      throw new BadRequestException('ids is empty');
    }
    for (let i = 0; i < pullLinkDto.ids.length; i++) {
      const id = pullLinkDto.ids[i];
      const resource: Author = await this.authorService.findById(id);
      const createDto: CreateAuthorDto = {
        name: resource.name,
        description: '',
        libraryId: pullLinkDto.libraryId,
        isLink: false,
        createBy: pullLinkDto.createBy,
        isPublic: pullLinkDto.isPublic ? pullLinkDto.isPublic : true,
        note: pullLinkDto.note,
      };
      try {
        const result = await this.authorService.create({...createDto});
        results.push(result);
      } catch (error) {
        errors.push({row: i + 1, error: error.message, resource});
      }
    }
    return {results, errors};
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permisson (CRUD)
  async findAll(@Query() query: Partial<CreateAuthorDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Author>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.authorService.findAll(pageOptionDto, query);
  }
  @Get('link')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'authors')) // tên permission và bảng cần chặn
  @UseGuards(CaslGuard) // chặn permission (CRUD)
  async lt(@Query() query: Partial<CreateAuthorDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Author>> {
   try {
     const user = request['user'];
     const libraryId = user?.libraryId ?? null;

     return await this.authorService.GetIsLink(libraryId, pageOptionDto, query);
   } catch (error) {
    console.log(error);
   }
  }

  @Get('/deleted')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findAllDeleted(@Query() query: Partial<CreateAuthorDto>, @Query() pageOptionDto: PageOptionsDto, @Req() request: Request): Promise<PageDto<Author>> {
    const user = request['user'];
    if (!user.isAdmin) {
      query.libraryId = new Types.ObjectId(user?.libraryId) ?? null;
    }
    return await this.authorService.findDeleted(pageOptionDto, query);
  }

  @Get('deleted/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOneDeleted(@Param('id') id: string): Promise<ItemDto<Author>> {
    return await this.authorService.findByIdDeleted(new Types.ObjectId(id));
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async findOne(@Param('id') id: ObjectId): Promise<ItemDto<Author>> {
    return await this.authorService.findOne(id);
  }

  @Delete('soft/selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async removes(@Body() ids: string[]): Promise<Array<Author>> {
    return await this.authorService.removes(ids);
  }

  @Delete('selected')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  deleteSelected(@Body() ids: string[]) {
    return this.authorService.deleteMultiple(ids);
  }

  @Delete('soft/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  remove(@Param('id') id: string) {
    return this.authorService.remove(id);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  delete(@Param('id') id: string) {
    return this.authorService.delete(id);
  }

  @Patch('restore')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async restoreByIds(@Body() ids: string[]): Promise<Author[]> {
    return this.authorService.restoreByIds(ids);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'authors')) // tên permisson và bảng cần chặn
  @UseGuards(CaslGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateAuthorDto): Promise<Author> {
    return await this.authorService.update(id, updateDto);
  }
}
