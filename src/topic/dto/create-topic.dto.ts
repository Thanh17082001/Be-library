import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Types } from "mongoose";
import { BaseDto } from "src/common/base.dto";

export class CreateTopicDto  extends  BaseDto {
    @ApiProperty()
    categoryId: Types.ObjectId;
    @ApiProperty()
    name: string;
}
