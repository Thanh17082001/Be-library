import {Injectable} from '@nestjs/common';
import {CreateTokenDto} from './dto/create-token.dto';
import {UpdateTokenDto} from './dto/update-token.dto';
import {InjectModel} from '@nestjs/mongoose';
import {Token} from './entities/token.entity';
import {Model} from 'mongoose';

@Injectable()
export class TokenService {
  constructor(@InjectModel(Token.name) private tokenModel: Model<Token>) {}
  async create(createDto: CreateTokenDto): Promise<Token> {
    return await this.tokenModel.create(createDto);
  }

  findAll() {
    return `This action returns all token`;
  }

  async findOne(data: object): Promise<Token> {
    return await this.tokenModel.findOne(data);
  }

  update(id: number, updateTokenDto: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }

  async remove(data: object): Promise<any> {
    return await this.tokenModel.findOneAndDelete(data);
  }
}
