import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "src/common/base.dto";

export class CreateExampleDto extends BaseDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}
