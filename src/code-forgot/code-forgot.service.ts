import {Injectable} from '@nestjs/common';
import {CreateCodeForgotDto} from './dto/create-code-forgot.dto';
import {UpdateCodeForgotDto} from './dto/update-code-forgot.dto';
import {InjectModel} from '@nestjs/mongoose';
import {CodeForgot} from './entities/code-forgot.entity';
import {Model} from 'mongoose';
import {generateVerificationCode} from 'src/common/random-code-forgot-pass';

@Injectable()
export class CodeForgotService {
  constructor(@InjectModel(CodeForgot.name) private codeForgotModel: Model<CodeForgot>) {}
  async create(createCodeForgotDto: CreateCodeForgotDto) {
    if (!createCodeForgotDto.code) {
      createCodeForgotDto.code = generateVerificationCode();
    }
    return await this.codeForgotModel.create({...createCodeForgotDto});
  }

  findAll() {
    return `This action returns all codeForgot`;
  }

  async findOne(email: string, code: string) {
    return await this.codeForgotModel.findOne({mail:email, code}).lean();
  }

  async checkConfirm(email: string, token: string) {
    return await this.codeForgotModel.findOne({ mail: email, token, isConfirm: true }).lean();
  }

  async findOneByEmail(email: string) {
    return await this.codeForgotModel.findOne({ mail :email}).sort({ createdAt: -1 }).lean();
  }

  async remove(email: string, code: string) {
    return await this.codeForgotModel.findOneAndDelete({mail:email, code});
  }

  async update(email: string, token: string) {
    return await this.codeForgotModel.findOneAndUpdate({ mail: email },{token:token, isConfirm:true});
  }
}
