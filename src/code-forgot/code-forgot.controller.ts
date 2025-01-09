import {Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import {CodeForgotService} from './code-forgot.service';
import {CreateCodeForgotDto} from './dto/create-code-forgot.dto';
import {UpdateCodeForgotDto} from './dto/update-code-forgot.dto';

@Controller('code-forgot')
export class CodeForgotController {
  constructor(private readonly codeForgotService: CodeForgotService) {}
}
