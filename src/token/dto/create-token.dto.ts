import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { isObjectIdOrHexString, Types } from "mongoose";

export class CreateTokenDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    @ApiProperty()
    @IsNotEmpty()
    userId: Types.ObjectId;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    expiresAt: Date;
}
