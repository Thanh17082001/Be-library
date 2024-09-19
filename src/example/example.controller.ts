import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { PageOptionsDto } from 'src/utils/page-option-dto';
import { PageDto } from 'src/utils/page.dto';
import { Example } from './entities/example.entity';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

@Controller('example')
@ApiTags('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  create(@Body() createExampleDto: CreateExampleDto) {
    return this.exampleService.create(createExampleDto);
  }

  @Get()
  findAll(@Query() query: Partial<CreateExampleDto>, @Query() pageOptionDto: PageOptionsDto): Promise<PageDto<Example>> {
    return this.exampleService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.exampleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExampleDto: UpdateExampleDto) {
    return this.exampleService.update(+id, updateExampleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exampleService.remove(+id);
  }
}
