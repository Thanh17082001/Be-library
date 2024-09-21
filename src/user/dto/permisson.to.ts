import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Permission } from "../entities/user.entity";


export class PermissonDto{
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty({example:{action:'read', resource:'test'}})
    @IsOptional()
    permisson:Permission
}