import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class BaseDto{

    @ApiProperty({ example: null })
    @IsOptional()
    @IsString()
    groupId: Types.ObjectId | null;

    @ApiProperty({ example: null })
    @IsOptional()
    @IsString()
    libraryId: Types.ObjectId | null;



    @ApiProperty({example:null})
    @IsOptional() 
    @IsString()
    createBy: Types.ObjectId | null;


    @ApiProperty({ example: false })
    @IsOptional()
    @IsBoolean()
    isPublic: boolean | null;

}