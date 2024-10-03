import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { Types } from "mongoose";
import { BaseDto } from "src/common/base.dto";

export class CreateLiquidationDto extends OmitType(BaseDto,['isLink','isPublic']) {

    @ApiProperty()
    @IsString()
    publicationId: Types.ObjectId;
    @ApiProperty()
    @IsString()
    reason: string;
    @ApiProperty()
    @IsNumber()
    quantity: number;
    @ApiProperty({ enum: ['thanh lý', 'hư hỏng'] })
    @IsString()
    status: string;
}
