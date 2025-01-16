import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ForgotPassDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;
}

export class ConfirmPass {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string;
}