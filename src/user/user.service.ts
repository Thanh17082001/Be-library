import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import { PermissonDto } from './dto/permisson.to';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>){}
  async create(createUserDto: CreateUserDto):Promise<User> {
    return await this.userModel.create(createUserDto)
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(data: any): Promise<User> {
    return await this.userModel.findOne(data).lean();
  }

  async addPermisson(permisstonDto:PermissonDto): Promise<User> {
    return await this.userModel.findByIdAndUpdate(
      { _id: new Types.ObjectId("66ed2fc6e3b5647c22c588c8") },  
      {
        $addToSet: {
          permissions: permisstonDto.permisson
        }
      },
      {
        returnDocument: 'after',
      }
    )
  }

  async removePermisson(permisstonDto: PermissonDto): Promise<User> {
    return await this.userModel.findByIdAndUpdate(
      { _id: new Types.ObjectId("66ed2fc6e3b5647c22c588c8") },
      {
        $pull: {
          permissions: permisstonDto.permisson
        }
      },
      {
        returnDocument: 'after',
      }
    )
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
