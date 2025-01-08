import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

class emailInterface  {
  name?: string='GDVN';
  email: string;
}
export class EmailDto {
  @ApiProperty({example:'Tiêu đề mail'})
  @IsString()
  subject?: string;
  body?: string;
  @ApiProperty({example:{name:'GDVN',email:'email@gmail.com'}})
  @IsOptional()
  sender?: emailInterface;
  @ApiProperty({ example: ['mail1@gmail.com', 'mail2@gmail.com'] ,description:'Danh sách email nhận'})
  @IsOptional()
  emails?: string[];
}
