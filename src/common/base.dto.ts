import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class BaseDto{
    @ApiProperty({example:'66ed2fc6e3b5647c22c588c8'})
    @IsOptional() 
    @IsString()
    createBy: Types.ObjectId | null;


    @ApiProperty({ example: false,description:'Giáo viên thấy cá nhân hoặc cho mọi người trong cùng một thư viên thấy' })
    @IsOptional()
    @IsBoolean()
    isPublic: boolean | null;

}