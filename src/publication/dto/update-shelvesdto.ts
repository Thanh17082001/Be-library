import {ObjectId, Types} from 'mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';

export class UpdateQuantityShelves {
  @ApiProperty({example: 'id'})
  @IsString()
  id: Types.ObjectId;

  @ApiProperty({example: 'shelves id'})
  @IsString()
  shelvesId: Types.ObjectId;

  @ApiProperty()
  @IsNumber()
  quantity: number = 0;
}
