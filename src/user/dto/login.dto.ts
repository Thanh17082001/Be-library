import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;
    @ApiProperty({example:'string'})
    @IsString()
    @IsNotEmpty()
    password: string;
}