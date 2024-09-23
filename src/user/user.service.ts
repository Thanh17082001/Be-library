import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async addPermisson(permissonDto: PermissonDto): Promise<User> {
    if (!Types.ObjectId.isValid(permissonDto.userId)) {
      throw new BadRequestException('User id not valid')
    }

    const user: User = await this.userModel.findOne({ _id: permissonDto.userId });
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return await this.userModel.findByIdAndUpdate(
      { _id: new Types.ObjectId(permissonDto.userId) },  
      {
        $addToSet: {
          permissions: permissonDto.permissons
        }
      },
      {
        returnDocument: 'after',
      }
    )
  }

  async removePermisson(permissonDto: PermissonDto): Promise<User> {
    if (!Types.ObjectId.isValid(permissonDto.userId)) {
      throw new BadRequestException('User id not valid')
    }

    const user: User = await this.userModel.findOne({ _id: permissonDto.userId });
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return await this.userModel.findByIdAndUpdate(
      { _id: new Types.ObjectId(permissonDto.userId) },
      {
        $pull: {
          permissions: permissonDto.permissons
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
